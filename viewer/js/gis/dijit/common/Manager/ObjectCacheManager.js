define([
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/json"
    ], function (
        declare,
        lang,
        JSON) {
    var ObjectCacheManager = declare([], {
            cachedData : {},

            addCachedData : function (identifier, data) {
                this.addCachedDataInternal(this.cachedData, identifier, data);
            },

            addCachedDataInternal : function (target, identifiers, data) {
                var currentIdentifier = identifiers.shift();
                if (!currentIdentifier) {
                    return;
                }
                if (!target[currentIdentifier]) {
                    var stringCacheData = '{"' + currentIdentifier + '": {}}';
                    var jsonCacheData = JSON.parse(stringCacheData);
                    lang.mixin(target, jsonCacheData);
                }

                if (identifiers.length === 0) {
                    target[currentIdentifier] = data;
                    return;
                }

                this.addCachedDataInternal(target[currentIdentifier], identifiers, data);
            },

            removeCachedData : function (identifier) {
                if (!identifier || identifier.length === 0) {
                    return;
                }
                var previousIdentifier = identifier.length === 1
                     ? identifier[0]
                     : identifier[identifier.length - 2];
                var cacheItem = this.searchCacheIdentifier(this.cachedData, identifier, true);
                delete cacheItem[previousIdentifier];
            },

            getCachedData : function (identifier) {
                var cacheItem = this.searchCacheIdentifier(this.cachedData, identifier);
                return cacheItem;
            },

            searchCacheIdentifier : function (searchTarget, identifiers, returnPrevious) {
                if (!identifiers || !searchTarget) {
                    return undefined;
                }
                if (identifiers.length === 0 || (returnPrevious && identifiers.length === 1)) {
                    return searchTarget;
                }
                var currentIdentifier = identifiers.shift();
                return this.searchCacheIdentifier(searchTarget[currentIdentifier], identifiers);
            }
        });
    if (!_instance) {
        var _instance = new ObjectCacheManager();
    }
    return _instance;
});