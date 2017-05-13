/**
 * App service, injected in app.js as dependency.
 **/
angular.module('pouchdb.service', [])

/**
 * Pouchdb a no-sql connector in local database.
 */
.factory('PouchDBService', function ($q, $rootScope, UtilityService) {
    var self = {};

    self.initDB = function () {
        var deferred = $q.defer();
        try {
            db = new PouchDB('meterReader.db', {
                adapter: 'websql'
            });
            deferred.resolve();
        } catch (err) {
            deferred.reject(err);
        }
        return deferred.promise;
    };

    // Add doc.
    self.put = function (obj) {
        return $q.when(
            db.put(obj)
        );
    };

    // Update/insert data.
    // Best to use when adding deleted data again to handle conflicts.
    self.upSert = function (obj) {
        return $q.when(db.upsert(obj._id, function (doc) {
            return obj;
        }));
    };

    // Update doc.
    self.update = function (obj) {
        return $q.when(
            db.get(obj._id).then(function (doc) {
                return db.put(obj, obj._id, doc._rev);
            })
        );
    };

    // Remove doc.
    self.remove = function (docID) {
        return $q.when(
            db.get(docID).then(function (doc) {
                return db.remove(doc);
            })
        );
    };

    // Get doc by id.
    self.getById = function (docID) {
        return $q.when(
            db.get(docID)
        );
    };

    // Dummy query to kick build of persistent queries.
    self.preQuery = function (designDocName) {
        return $q.when(db.query(designDocName, {
            limit: 0
        }));
    };

    // Map doc to array.
    self.mapDoctoArray = function (doc) {
        return doc.rows.map(function (arr) {
            return arr.doc;
        });
    };

    // Create design doc.
    self.createDesignDoc = function (name, mapFunction) {
        var ddoc = {
            _id: '_design/' + name,
            views: {}
        };
        ddoc.views[name] = {
            map: mapFunction.toString()
        };
        return ddoc;
    };

    // Create view for type.
    self.createView = function (viewName) {
        return $q.when(
            db.putIfNotExists(self.createDesignDoc(viewName, function (doc) {
                emit(doc.docType);
            }))
        );
    };

    // Query design doc.
    self.query = function (designDocName, docType) {
        return $q.when(db.query(designDocName, {
            key: docType,
            include_docs: true
        }));
    };

    // Add list of design doc in db.
    self.addDesignDoc = function (arr) {
        var deferred = $q.defer();
        var promises = [];
        // Create list of design doc for query.
        for (var d = 0; d < arr.length; d++) {
            promises.push(self.createView(arr[d].viewName));
        }
        // Promise chain.
        $q.all(promises)
            .then(function () {
                deferred.resolve();
            })
            .catch(function (err) {
                deferred.reject(err);
            });
        return deferred.promise;
    };

    // Make a pre query of view.
    self.preBuildQuery = function (arr) {
        var deferred = $q.defer();
        // List of promise.
        var promises = [];
        for (var d = 0; d < arr.length; d++) {
            promises.push(self.preQuery(arr[d].viewName));
        }
        // Wait for all promise to done.
        $q.all(promises)
            .then(function () {
                deferred.resolve();
            })
            .catch(function (err) {
                deferred.reject(err);
            });
        return deferred.promise;
    };

    // Search array.
    self.binarySearch = function (arr, docId) {
        var low = 0,
            high = arr.length,
            mid;
        while (low < high) {
            mid = (low + high) >>> 1;
            if (arr[mid]._id < docId) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }
        return low;
    };

  /*  // Callback to delete data in array.
    self.onChangeDelete = function (id, fieldname) {
        var index;
        var doc;
        if (fieldname === 'flowMeter') {
            index = self.binarySearch($rootScope.list.flowMeterList, id);
            doc = $rootScope.list.flowMeterList[index];
        } else if (fieldname === 'nfcTag') {
            index = self.binarySearch($rootScope.list.nfcTagList, id);
            doc = $rootScope.list.nfcTagList[index];
        }
        // Delete on list.
        $rootScope.$apply(function () {
            if (doc && doc._id === id) {
                if (fieldname === 'flowMeter') {
                    $rootScope.list.flowMeterList.splice(index, 1);
                } else if (fieldname === 'nfcTag') {
                    $rootScope.list.nfcTagList.splice(index, 1);
                }
            }
        });
    }; */

    // Callback to add/update new doc in array.
    self.onChangeUpSert = function (newDoc, fieldname) {
        var index;
        var doc;
        if (fieldname === 'flowMeter') {
            index = self.binarySearch($rootScope.list.flowMeterList, newDoc._id);
            doc = $rootScope.list.flowMeterList[index];
        } else if (fieldname === 'nfcTag') {
            index = self.binarySearch($rootScope.list.nfcTagList, newDoc._id);
            doc = $rootScope.list.nfcTagList[index];
        }
        $rootScope.$apply(function () {
            // Update
            if (doc && doc._id === newDoc._id) {
                if (fieldname === 'flowMeter') {
                    $rootScope.list.flowMeterList[index] = newDoc;
                } else if (fieldname === 'nfcTag') {
                    $rootScope.list.nfcTagList[index] = newDoc;
                }
            } else {
                // Insert
                if (fieldname === 'flowMeter') {
                    $rootScope.list.flowMeterList.splice(index, 0, newDoc);
                } else if (fieldname === 'nfcTag') {
                    $rootScope.list.nfcTagList.splice(index, 0, newDoc);
                }
            }
        });
    };

    // Listener to changes in database.
    // Sync changes to array associated to it.
    self.watchDBChange = function () {
        db.changes({
            live: true,
            since: 'now',
            include_docs: true
        }).on('change', function (change) {
            if (change.deleted) {
               /* if (change.id.indexOf('_flow_meter') !== -1) {
                    self.onChangeDelete(change.id, 'flowMeter');
                } else if (change.id.indexOf('station_') !== -1) {
                    self.onChangeDelete(change.id, 'nfcTag');
                }*/
            } else {
                if (change.id.indexOf('_flow_meter') !== -1) {
                    self.onChangeUpSert(change.doc, 'flowMeter');
                } else if (change.id.indexOf('_nfc_tag') !== -1) {
                    self.onChangeUpSert(change.doc, 'nfcTag');
                }
            }
        });
    };

    return self;
});