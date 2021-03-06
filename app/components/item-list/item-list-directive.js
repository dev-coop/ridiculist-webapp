'use strict';

function list($routeParams, $timeout, $location, ItemListFactory, LIST_TYPES, $interval) {
  return {
    restrict: 'E',
    replace: true,
    scope: {},
    templateUrl: 'app/components/item-list/item-list.html',
    link: function(scope, elem, attrs) {
      var listId = $routeParams.id;

      scope.init = function() {
        scope.LIST_TYPES = LIST_TYPES;

        if (listId) {
          scope.itemList = ItemListFactory.getByListId(listId);
        } else {
          scope.itemList = new ItemListFactory();
          scope.addItem();
        }

        $interval(function() {
          scope.itemList.validate();
        }, 200);
      };

      //
      // Items
      //
      scope.addItem = function() {
        scope.itemList.addItem();
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

      scope.toggleItem = function(index) {
        if (!scope.isReadOnly) {
          scope.itemList.toggleItem(index);
        }
      };

      //
      // Item List
      //

      scope.setListType = function(type) {
        scope.itemList.setType(type);
      };

      scope.toggleFeatured = function() {
        scope.itemList.list.$toggleSecurity();
      };

      scope.create = function() {
        scope.itemList.create().then(function(itemList) {
          scope.itemList = itemList;
          $location.path(itemList.list.$id);
        });
      };

      scope.destroy = function() {
        scope.itemList.destroy();
        $location.path('/');
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
          scope.create();
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
