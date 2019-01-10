# Changelog

## [1.1.0] - 2019-01-10

### Features
* menu action buttons to add columns to the left/right of selected table column,
and buttons to add content rows above/below of selected table column
* allow dragging of selected section and of section band height
* link property for text and image element to create an external link
* strikethrough text style

### Bug Fixes
* fix updating parameter references when renaming a parameter which is used inside a table in a section
* remove references when a style is deleted
* update element using style when style is changed
* fix menu item display in sidebar menu
* fix deletion of section: internal containers for section bands were not deleted,
undo delete action did not work properly (elements inside section bands were not restored)
* fix display of error messages for table band print-if field
* do not ignore test data for boolean parameter in report preview

### Changes
* allow up to 99 table content rows
* add printIf and removeEmptyElement fields for table
* section and frame can be selected with double click
* more options for text line spacing
* copy pasted element to current scroll position instead of upper left corner

## [1.0.0] - 2018-09-25

### Bug Fixes
* allow edit text element pattern field and add button to open pattern popup window
* do not show search field in pattern popup
* fix drag & drop of collection/list parameter in menu panel
* fix updating parameter references when renaming a parameter
* fix dragging element into frame with border

### Changes
* show separator for data source parameters in parameter popup window
* make sure there is enough space for popup below input, otherwise just show it over input field
* setModified method to change modified status (defines if save button is enabled)
* return ReportBro instance when ReportBro is initialized

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
