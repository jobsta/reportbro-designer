# Changelog

## [0.12.1] - 2018-06-06

### Features
* section elements to iterate lists
* column range spreadsheet property
* copy & paste of parameters and styles
* search filter in parameter popup
* allow decimal values for border width
* selection of elements by dragging a rectangle in the layout editor
* better design for nested menu panel items

### Bug Fixes
* fix drag & drop and resizing of multiple selected elements when an element is not aligned on the grid
* allow undo of pasted elements
* keep position of nested elements when pasting frames
* test if dragging menu panel is allowed to new destination (e.g. element cannot be dragged into table band or table text element)
* only show horizontal/vertical alignment buttons if appropriate (container of selected elements must have same x/y-offset)

## [0.11.2] - 2018-04-10

### Features
* support for dynamic table column (column containing simple array parameter will be expanded to multiple columns)

### Bug Fixes
* text element styling when element uses predefined style with borders
* fix undo of deleted frame element (restore nested elements)
* fix display of table column texts when padding of a column text is modified

## [0.11.1] - 2018-03-21

### Features
* multiple content row definitions for tables
* group expression and print if for table content rows
* boolean parameter type
* simple list parameter type (list items with basic type like string, number, boolean, date)
* nullable setting for parameter to explicitly allow nullable parameters, non-nullable parameters automatically get default value in case there is no data (e.g. 0 for numbers or '' for strings)

### Bug Fixes
* update table column element height when table row height is changed
* copy&paste of frame elements
* save eval setting of table column text

## [0.10.1] - 2017-11-02

### Features
* frame elements to group document elements

## [0.9.9] - 2017-08-19

Initial release.
