# Changelog

## [2.0.1] - 2022-01-28

### Changes
* add requestCallback which is called before a preview request (pdf/xlsx) and
  can be used to change request parameters
* support request headers for preview request (pdf/xlsx)
* upgrade dependencies to fix potential security vulnerabilities

## [2.0.0] - 2021-08-06

### Features
* Rich Text (PLUS version)
* QR Code
* option to set basic auth for report preview request
* option to set custom headers for report preview request
* option to repeat table group on each page
* option to set colors for color palette
* option to set available font sizes

### Changes
* update all package dependencies and adapt webpack configuration for webpack 5
  to remove build warnings (upgrade to npm v7)
* remove external dependencies for autosize, JsBarcode and spectrum
* add processErrors API method to display report errors
* add clearErrors API method to clear existing report errors

## [1.6.0] - 2021-03-19

### Features
* zoom buttons for document panel

### Changes
* add parameter to cmdExecutedCallback which indicates if command was done or undone
* add "copy" suffix to name of pasted parameter and style for unique names
* only update parameter references on name change if the parameter name is unique
* Allow starting area selection inside container (frame/section) and
  do not include container element in area selection

### Bug Fixes
* set correct cell height when table is created/updated

## [1.5.2] - 2020-10-06

### Changes
* option to set default font for new text and style
* update logo and css styling
* option to set css theme
* add getClassName method for introspection to command, data and element classes

## [1.5.1] - 2020-07-27

### Features
* option to highlight unused parameters on report load

### Changes
* add destroy method to remove dom nodes and event handlers
* allow border width in 0.5 steps

### Bug Fixes
* update table width after deleting column

## [1.5.0] - 2020-07-15

### Features
* option to expand column width if there are hidden columns
* option to force page break for each new group in a table
* option to enable text wrap in spreadsheet cell

### Changes
* show list parameters in popup window for expression
(this allows to reference fields of the same row in the expression)

### Bug Fixes
* fix javascript error when parameter name is empty

## [1.4.0] - 2020-04-20

### Features
* dynamic document element panel which allows modifying multiple
document elements (also of different kinds) at once
* allow modifying text style settings when a style is selected

### Changes
* add selectCallback which is called when an object is selected/deselected
* add isModified API method to return modified flag
* allow image parameter type in list parameter
* add smaller font sizes to drop down (starting from 4)
* show image preview for images specified by url

### Bug Fixes
* fix initialization of ReportBro when called without properties
* fix adding new elements when preview tab exists (Chrome on macOS)

## [1.3.4] - 2019-12-23

### Changes
* option to show menu buttons to log report template to console and load report template from text

### Bug Fixes
* fix changing table columns when table contains cells with colspan
* fix loading report with small table (< 200px) with table positioned near right border

## [1.3.3] - 2019-11-08

### Bug Fixes
* do not show resize mouse cursor in corners when table is selected
* fix setting transparent color
* fix parameter type drop down options in Safari
* fix content area and ReportBro logo alignment when sidebar is active

## [1.3.2] - 2019-09-03

### Bug Fixes
* fix freeze when inserting table columns left or right to selected table cell
* fix checking bounds when table is dragged over right border

## [1.3.1] - 2019-09-02

### Changes
* do not allow deletion of internal row_number parameter
* insert internal row_number parameter at top

### Bug Fixes
* do not show internal row_number parameter in "Edit test data" popup

## [1.3.0] - 2019-08-26

### Features
* sizer to change main panel width
* column span field for table text element
* add internal parameter row_number for list parameters
* add locales for separate language files (English and German available)

### Changes
* focus text input when text element is double clicked

### Bug Fixes
* disable save button depending on modified flag
* do not allow setting invalid color value

## [1.2.1] - 2019-07-22

### Bug Fixes
* fix drag & drop and resize of document elements in Firefox
* fix npm package

## [1.2.0] - 2019-07-05

### Features
* basic touch support to drag & drop and resize document elements
* public API methods to get, add and delete objects:
getUniqueId, getDocElementById, getStyleById, getParameterById, getParameterByName,
createDocElement, createParameter, createStyle, deleteDocElement, deleteParameter, deleteStyle

### Changes
* add cmdExecutedCallback which is called when a command is exuected

### Bug Fixes
* delete existing document elements when loading report
* fix issue when editing image size

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
