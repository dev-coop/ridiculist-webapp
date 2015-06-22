'use strict';

function list($routeParams, $timeout, ItemListFactory, LIST_TYPES) {
    return {
        restrict: 'E',
        replace: true,
        scope: {},
        templateUrl: 'app/components/item-list/item-list.html',
        link: function(scope, elem, attrs) {
            var listId = $routeParams.id;

            scope.init = function() {
                scope.LIST_TYPES = LIST_TYPES;
                scope.isNew = !listId;

                if (scope.isNew) {
                    scope.itemList = new ItemListFactory();
                    scope.addItem();
                } else {
                    ItemListFactory.getByListId(listId).then(function(response) {
                        scope.itemList = response;
                    });
                }
            };

            //
            // Items
            //
            scope.addItem = function() {
                scope.itemList.add({type: scope.itemList.list.type});
            };

            scope.focusItem = function(index) {
                var focusInput = document.getElementsByClassName('lst-list-item-input')[index];
                if (focusInput) {
                    focusInput.focus();
                }
            };

            scope.onItemChange = function() {
                var totalBlank = 0;

                scope.itemList.items.forEach(function(item, i, arr) {
                    var isBlank = item.name.trim().length === 0;
                    var isLast = i === arr.length - 1;

                    totalBlank += isBlank ? 1 : 0;

                    // remove spare empty items
                    if (isBlank && !isLast) {
                        scope.focusItem(i);
                        arr.splice(i, 1);
                    }
                });

                if (totalBlank === 0) {
                    scope.addItem();
                }
            };

            //
            // Item List
            //

            scope.setListType = function(type) {
                scope.itemList.setType(type);
            };

            scope.save = function() {
                scope.itemList.save();
            };

            //
            // Get Link
            //

            scope.getLink = function() {
                return scope.itemList.getLink();
            };

            scope.onCopy = function() {
                scope.linkCopied = true;

                $timeout(function() {
                    scope.linkCopied = false;
                }, 1000);
            };
            
            //
            // Bindings
            //

            scope.handleEnterKey = function(e, itemIndex) {
                var offset;

                if (e.metaKey) {
                    scope.save();
                } else {
                    offset = e.shiftKey ? -1 : 1;
                    scope.focusItem(itemIndex + offset);
                }
            };

            scope.onKeydown = function(e, itemIndex) {
                switch (e.keyCode) {
                    // Enter
                    case 13:
                        scope.handleEnterKey(e, itemIndex);
                        break;
                }
            };

            scope.init();
        }
    }
}

angular.module('App.itemList')
    .directive('list', list);
