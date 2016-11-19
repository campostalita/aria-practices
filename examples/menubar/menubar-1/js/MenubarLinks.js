/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*
*   File:   Menubar.js
*
*   Desc:   Menubar widget that implements ARIA Authoring Practices
*
*   Author: Jon Gunderson, Ku Ja Eun and Nicholas Hoyt
*/

/*
*   @constructor Menubar
*
*   @desc
*       Wrapper object for a menubar (with nested submenus of links)
*
*   @param domNode
*       The DOM element node that serves as the menubar container. Each
*       child element of menubarNode that represents a menubaritem must
*       be an A element
*/

var Menubar = function (domNode) {
  var elementChildren,
      msgPrefix = 'Menubar constructor argument menubarNode ';

  // Check whether menubarNode is a DOM element
  if (!domNode instanceof Element) {
    throw new TypeError(msgPrefix + 'is not a DOM Element.');
  }

  // Check whether menubarNode has descendant elements
  if (domNode.childElementCount === 0) {
    throw new Error(msgPrefix + 'has no element children.');
  }

  // Check whether menubarNode has A elements
  e = domNode.firstElementChild;
  while (e) {
    var menubarItem = e.firstElementChild;
    if (e && menubarItem && menubarItem.tagName !== 'A') {
      throw new Error(msgPrefix + 'has child elements are note A elements.');
    }
    e = e.nextElementSibling;
  }

  this.domNode = domNode;

  this.menubarItems = []; // See Menubar init method
  this.firstChars = []; // See Menubar init method

  this.firstItem = null; // See Menubar init method
  this.lastItem = null; // See Menubar init method

  this.hasFocus = false; // See MenubarItem handleFocus, handleBlur
  this.hasHover = false; // See Menubar handleMouseover, handleMouseout
};

/*
*   @method Menubar.prototype.init
*
*   @desc
*       Adds ARIA role to the menubar node
*       Traverse menubar children for A elements to configure each A element as a ARIA menuitem
*       and populate menuitems array. Initialize firstItem and lastItem properties.
*/
Menubar.prototype.init = function () {
  var menubarItem, childElement, menuElement, textContent, numItems;

  this.domNode.setAttribute('role', 'menubar');

  // Traverse the element children of menubarNode: configure each with
  // menuitem role behavior and store reference in menuitems array.
  e = this.domNode.firstElementChild;

  while (e) {
    var menuElement = e.firstElementChild;

    if (e && menuElement && menuElement.tagName === 'A') {
      menubarItem = new MenubarItem(menuElement, this);
      menubarItem.init();
      this.menubarItems.push(menubarItem);
      textContent = menuElement.textContent.trim();
      this.firstChars.push(textContent.substring(0, 1).toLowerCase());
    }

    e = e.nextElementSibling;
  }

  // Use populated menuitems array to initialize firstItem and lastItem.
  numItems = this.menubarItems.length;
  if (numItems > 0) {
    this.firstItem = this.menubarItems[ 0 ];
    this.lastItem = this.menubarItems[ numItems - 1 ];
  }
  this.firstItem.domNode.tabIndex = 0;
};

/* FOCUS MANAGEMENT METHODS */

Menubar.prototype.setFocusToFirstItem = function (flag) {
  this.firstItem.domNode.focus();

  if (flag && this.firstItem.popupMenu) {
    this.firstItem.popupMenu.open();
  }
};

Menubar.prototype.setFocusToLastItem = function (flag) {
  this.lastItem.domNode.focus();

  if (flag && this.lastItem.popupMenu) {
    this.lastItem.popupMenu.open();
  }
};

Menubar.prototype.setFocusToPreviousItem = function (currentItem, flag) {
  var index;
  var newItem = false;

  currentItem.domNode.tabIndex = -1;

  if (currentItem === this.firstItem) {
    newItem = this.lastItem;
  }
  else {
    index = this.menubarItems.indexOf(currentItem);
    newItem = this.menubarItems[ index - 1 ];
  }

  if (flag && newItem.popupMenu) {
    newItem.popupMenu.open();
    newItem.popupMenu.firstItem.domNode.focus();
    newItem.popupMenu.firstItem.domNode.tabIndex = 0;
  }
  else {
    newItem.domNode.focus();
    newItem.domNode.tabIndex = 0;
  }

};

Menubar.prototype.setFocusToNextItem = function (currentItem, flag) {
  var index;
  var newItem = false;
  currentItem.domNode.tabIndex = -1;

  if (currentItem === this.lastItem) {
    newItem = this.firstItem;
  }
  else {
    index = this.menubarItems.indexOf(currentItem);
    newItem = this.menubarItems[ index + 1 ];
  }

  if (flag && newItem.popupMenu) {
    newItem.popupMenu.open();
    newItem.popupMenu.firstItem.domNode.focus();
    newItem.popupMenu.firstItem.domNode.tabIndex = 0;
  }
  else {
    newItem.domNode.focus();
    newItem.domNode.tabIndex = 0;
  }

};

Menubar.prototype.setFocusByFirstCharacter = function (currentItem, char) {
  var start, index, char = char.toLowerCase();

  // Get start index for search based on position of currentItem
  start = this.menubarItems.indexOf(currentItem) + 1;
  if (start === this.menubarItems.length) {
    start = 0;
  }

  // Check remaining slots in the menu
  index = this.getIndexFirstChars(start, char);

  // If not found in remaining slots, check from beginning
  if (index === -1) {
    index = this.getIndexFirstChars(0, char);
  }

  // If match was found...
  if (index > -1) {
    this.menubarItems[ index ].domNode.focus();
    this.menubarItems[ index ].domNode.tabIndex = 0;
    currentItem.tabIndex = -1;
  }
};

Menubar.prototype.getIndexFirstChars = function (startIndex, char) {
  for (var i = startIndex; i < this.firstChars.length; i++) {
    if (char === this.firstChars[ i ]) {
      return i;
    }
  }
  return -1;
};

