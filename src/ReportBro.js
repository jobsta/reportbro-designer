import Document from './Document';
import PopupWindow from './PopupWindow';
import AddDeleteDocElementCmd from './commands/AddDeleteDocElementCmd';
import Command from './commands/Command';
import CommandGroupCmd from './commands/CommandGroupCmd';
import SetValueCmd from './commands/SetValueCmd';
import Band from './container/Band';
import Container from './container/Container';
import DocumentProperties from './data/DocumentProperties';
import Parameter from './data/Parameter';
import Style from './data/Style';
import BarCodeElement from './elements/BarCodeElement';
import DocElement from './elements/DocElement';
import ImageElement from './elements/ImageElement';
import LineElement from './elements/LineElement';
import PageBreakElement from './elements/PageBreakElement';
import TableBandElement from './elements/TableBandElement';
import TableElement from './elements/TableElement';
import TableTextElement from './elements/TableTextElement';
import TextElement from './elements/TextElement';
import BarCodeElementPanel from './panels/BarCodeElementPanel';
import DocumentPropertiesPanel from './panels/DocumentPropertiesPanel';
import EmptyDetailPanel from './panels/EmptyDetailPanel';
import ImageElementPanel from './panels/ImageElementPanel';
import LineElementPanel from './panels/LineElementPanel';
import MainPanel from './menu/MainPanel';
import MainPanelItem from './menu/MainPanelItem';
import MenuPanel from './menu/MenuPanel';
import PageBreakElementPanel from './panels/PageBreakElementPanel';
import ParameterPanel from './panels/ParameterPanel';
import StylePanel from './panels/StylePanel';
import TableElementPanel from './panels/TableElementPanel';
import TableBandElementPanel from './panels/TableBandElementPanel';
import TextElementPanel from './panels/TextElementPanel';

/**
 * Used for the main ReportBro instance.
 * @class
 */
export default class ReportBro {
    constructor(element, properties) {
        this.element = element;
        this.nextId = 1;
        this.locale = {
            bandContent: 'Content',
            bandFooter: 'Footer',
            bandHeader: 'Header',
            barCodeElementContent: 'Content',
            barCodeElementDisplayValue: 'Display value',
            barCodeElementFormat: 'Format',
            contentHeight: 'Content height',
            contentHeightInfo: 'affects only GUI size to place elements and not the real page size',
            docElementAlwaysPrintOnSamePage: 'Always on same page',
            docElementBarCode: 'Bar code',
            docElementColor: 'Color',
            docElementConditionalStyle: 'Conditional style',
            docElementConditionalStyleCondition: 'Condition',
            docElementHeight: 'Height',
            docElementImage: 'Image',
            docElementLine: 'Line',
            docElementPageBreak: 'Page break',
            docElementPosition: 'Position (x, y)',
            docElementPositionX: 'Position (x)',
            docElementPositionY: 'Position (y)',
            docElementPrintIf: 'Print if',
            docElementPrintSettings: 'Print settings',
            docElementRemoveEmptyElement: 'Remove when empty',
            docElementRoot: 'Document',
            docElementSize: 'Size (width, height)',
            docElementSpreadsheet: 'Spreadsheet',
            docElementSpreadsheetAddEmptyRow: 'Add empty row below',
            docElementSpreadsheetColumn: 'Fixed column',
            docElementSpreadsheetHide: 'Hide',
            docElementWidth: 'Width',
            docElementStyle: 'Style',
            docElementTable: 'Table',
            docElementText: 'Text',
            documentProperties: 'Document properties',
            documentTabClose: 'Close',
            documentTabPdfLayout: 'PDF Layout',
            documentTabPdfPreview: 'PDF Preview',
            documentTabXlsxDownload: 'XLSX Download',
            emptyPanel: 'Empty panel',
            errorMsgDuplicateParameterField: 'Field already exists',
            errorMsgInvalidArray: 'Invalid list',
            errorMsgInvalidAvgSumExpression: 'Expression must contain number field of a list parameter',
            errorMsgInvalidBarCode: 'Invalid bar code content',
            errorMsgInvalidDataSource: 'Invalid data source',
            errorMsgInvalidDataSourceParameter: 'Parameter must be a list',
            errorMsgInvalidDate: 'Invalid date, expected format is YYYY-MM-DD ( or YYYY-MM-DD hh:mm for date with time)',
            errorMsgInvalidExpression: 'Invalid expression: ${info}',
            errorMsgInvalidExpressionFuncNotDefined: 'Function ${info} not defined',
            errorMsgInvalidExpressionNameNotDefined: 'Name ${info} not defined',
            errorMsgInvalidImage: 'Invalid image data, image must be base64 encoded',
            errorMsgInvalidImageSource: 'Invalid source, expected url starting with http:// or https://',
            errorMsgInvalidImageSourceParameter: 'Parameter must be an image or string (containing a url)',
            errorMsgInvalidMap: 'Invalid collection',
            errorMsgInvalidNumber: 'Invalid number',
            errorMsgInvalidPageSize: 'Invalid page size',
            errorMsgInvalidParameterData: 'Data does not match parameter',
            errorMsgInvalidParameterName: 'Name must start with a character or underscore, and must only contain characters, digits and underscores (_)',
            errorMsgInvalidPattern: 'Invalid pattern',
            errorMsgInvalidPosition: 'The position is outside the area',
            errorMsgInvalidSize: 'The element is outside the area',
            errorMsgMissingData: 'Missing data',
            errorMsgMissingDataSourceParameter: 'Data source parameter not found',
            errorMsgMissingExpression: 'Expression must be set',
            errorMsgMissingImage: 'Missing image, no source or image file specified',
            errorMsgMissingParameter: 'Parameter not found',
            errorMsgMissingParameterData: 'Data for parameter {info} not found',
            errorMsgUnicodeEncodeError: 'Text contains non printable character',
            errorMsgUnsupportedImageType: 'Image does not have supported image type (.jpg, .png)',
            footer: 'Footer',
            footerDisplay: 'Display',
            footerSize: 'Footer size',
            imageElementImage: 'Image file',
            imageElementLoadErrorMsg: 'Loading image failed',
            imageElementSource: 'Source',
            header: 'Header',
            headerDisplay: 'Display',
            headerFooterDisplayAlways: 'Always',
            headerFooterDisplayNotOnFirstPage: 'Do not show on first page',
            headerSize: 'Header size',
            menuAlignBottom: 'Align bottom',
            menuAlignCenter: 'Align center',
            menuAlignLeft: 'Align left',
            menuAlignMiddle: 'Align middle',
            menuAlignRight: 'Align right',
            menuAlignTop: 'Align top',
            menuPreview: 'PREVIEW',
            menuPreviewTip: 'Preview report',
            menuRedo: 'REDO',
            menuRedoTip: 'Repeat last undone command',
            menuSave: 'SAVE',
            menuSaveTip: 'Save report',
            menuToggleGrid: 'Show/Hide grid',
            menuUndo: 'UNDO',
            menuUndoTip: 'Undo last command',
            orientation: 'Orientation',
            orientationBottom: 'bottom',
            orientationLandscape: 'Landscape',
            orientationLeft: 'left',
            orientationPortrait: 'Portrait',
            orientationRight: 'right',
            orientationTop: 'top',
            pageFormat: 'Page format',
            pageFormatA4: 'DIN A4 (210 x 297 mm)',
            pageFormatA5: 'DIN A5 (148 x 210 mm)',
            pageFormatLetter: 'Letter (8.5 x 11.0 inches)',
            pageFormatUserDefined: 'Own dimensions',
            pageHeight: 'height',
            pageMargins: 'Page margins',
            pageWidth: 'width',
            parameter: 'Parameter',
            parameterExpression: 'Expression',
            parameterListType: 'List type',
            parameterName: 'Name',
            parameterPattern: 'Pattern',
            parameters: 'Parameters',
            parameterAddTestData: 'Add row',
            parameterEditTestData: 'Edit',
            parameterEditTestDataNoFields: 'No fields defined for this list',
            parameterEval: 'Evaluate',
            parameterTestData: 'Test data',
            parameterTestDataDatePattern: 'YYYY-MM-DD',
            parameterType: 'Type',
            parameterTypeArray: 'List',
            parameterTypeAverage: 'Average',
            parameterTypeDate: 'Date',
            parameterTypeImage: 'Image',
            parameterTypeMap: 'Collection',
            parameterTypeNumber: 'Number',
            parameterTypeString: 'Text',
            parameterTypeSum: 'Sum',
            patternCurrencySymbol: 'Pattern currency symbol',
            patternDate1: 'day.month.year, e.g. 1.6.1980',
            patternDate2: 'day.month.year (2-digit), hour(24h):minute, e.g. 1.6.80, 14:30',
            patternDate3: 'day/month/year (month abbreviation), e.g. 1/Jun/1980',
            patternDate4: 'month/day/year (day and month with leading zero if single digit), e.g. 06/01/1980',
            patternLocale: 'Pattern locale',
            patternNumber1: 'Show thousand separator',
            patternNumber2: 'Show decimal point followed by 3 decimal places',
            patternNumber3: 'Show decimal point followed by minimum of 2 and maximum of 4 decimal places',
            patternNumber4: 'Show thousand separator and decimal point followed by 2 decimal places',
            patternNumber5: 'Show currency symbol in front of number',
            patternSeparatorDates: '--- Date patterns ---',
            patternSeparatorNumbers: '--- Number patterns ---',
            select: 'select...',
            style: 'Style',
            styleAlignment: 'Alignment',
            styleBackgroundColor: 'Background color',
            styleBold: 'Bold',
            styleBorder: 'Border',
            styleBorderAll: 'borders',
            styleBorderColor: 'Border color',
            styleBorderWidth: 'Border width',
            styleFont: 'Font',
            styleFontSizeUnit: 'pt',
            styleHAlignmentCenter: 'Center',
            styleHAlignmentLeft: 'Left',
            styleHAlignmentJustify: 'Justify',
            styleHAlignmentRight: 'Right',
            styleItalic: 'Italic',
            styleLineSpacing: 'Line spacing',
            styleName: 'Name',
            styleNone: 'None',
            stylePadding: 'Padding',
            styleTextColor: 'Text color',
            styleTextStyle: 'Text style',
            styleUnderline: 'Underline',
            styleVAlignmentBottom: 'Bottom',
            styleVAlignmentMiddle: 'Middle',
            styleVAlignmentTop: 'Top',
            styles: 'Styles',
            tableElementAlternateBackgroundColor: 'Alternate background color',
            tableElementBorderFrame: 'Frame',
            tableElementBorderFrameRow: 'Frame and row',
            tableElementBorderGrid: 'Grid',
            tableElementBorderNone: 'None',
            tableElementBorderRow: 'Row',
            tableElementColumns: 'Columns',
            tableElementDataSource: 'Data source',
            tableElementRepeatHeader: 'Repeat header',
            textElementContent: 'Text',
            textElementEval: 'Evaluate',
            textElementPattern: 'Pattern'
        };

        this.properties = {
            additionalFonts: [],
            adminMode: true,
            enableSpreadsheet: true,
            fonts: [
                { name: 'Courier', value: 'courier' },
                { name: 'Helvetica', value: 'helvetica' },
                { name: 'Times New Roman', value: 'times' }
            ],
            localStorageReportKey: null,
            menuShowButtonLabels: false,
            menuSidebar: false,
            saveCallback: null,
            showGrid: true,
            patternAdditionalDates: [],
            patternAdditionalNumbers: [],
            patternCurrencySymbol: '$',
            patternDates: [
                { name: 'd.M.yyyy', description: this.locale['patternDate1'] },
                { name: 'd.M.yy, H:mm', description: this.locale['patternDate2'] },
                { name: 'd/MMM/yyyy', description: this.locale['patternDate3'] },
                { name: 'MM/dd/yyyy', description: this.locale['patternDate4'] }
            ],
            patternLocale: 'en',
            patternNumbers: [
                { name: '#,##0', description: this.locale['patternNumber1'] },
                { name: '0.000', description: this.locale['patternNumber2'] },
                { name: '0.00##', description: this.locale['patternNumber3'] },
                { name: '#,##0.00', description: this.locale['patternNumber4'] },
                { name: '$ #,##0.00', description: this.locale['patternNumber5'] }
            ],
            reportServerTimeout: 20000,
            reportServerUrl: 'https://www.reportbro.com/report/run',
            reportServerUrlCrossDomain: false
        };
        if (properties) {
            for (let prop in properties) {
                if (this.properties.hasOwnProperty(prop)) {
                    this.properties[prop] = properties[prop];
                }
            }
            $.extend( this.locale, properties['locale'] || {} );
        }
        if (this.properties.additionalFonts.length > 0) {
            this.properties.fonts = this.properties.fonts.concat(this.properties.additionalFonts);
        }
        if (this.properties.patternAdditionalDates.length > 0) {
            this.properties.patternDates = this.properties.patternDates.concat(this.properties.patternAdditionalDates);
        }
        if (this.properties.patternAdditionalNumbers.length > 0) {
            this.properties.patternNumbers = this.properties.patternNumbers.concat(this.properties.patternAdditionalNumbers);
        }

        this.detailData = null;
        this.document = new Document(element, this.properties.showGrid, this);
        this.popupWindow = new PopupWindow(element, this);
        this.docElements = [];
        this.headerBand = new Band(Document.band.header, this);
        this.contentBand = new Band(Document.band.content, this);
        this.footerBand = new Band(Document.band.footer, this);
        this.parameterContainer = new Container('0_parameters', this.getLabel('parameters'), this);
        this.styleContainer = new Container('0_styles', this.getLabel('styles'), this);
        this.documentProperties = new DocumentProperties(this);
        this.clipboardElements = [];

        this.mainPanel = new MainPanel(element, this.headerBand, this.contentBand, this.footerBand,
                this.parameterContainer, this.styleContainer, this);
        this.menuPanel = new MenuPanel(element, this);
        this.activeDetailPanel = 'none';
        this.detailPanels = {
            'none': new EmptyDetailPanel(element, this),
            'bar_code': new BarCodeElementPanel(element, this),
            'text': new TextElementPanel(element, this),
            'line': new LineElementPanel(element, this),
            'image': new ImageElementPanel(element, this),
            'page_break': new PageBreakElementPanel(element, this),
            'table': new TableElementPanel(element, this),
            'table_band': new TableBandElementPanel(element, this),
            'parameter': new ParameterPanel(element, this),
            'style': new StylePanel(element, this),
            'documentProperties': new DocumentPropertiesPanel(this.documentProperties, element, this)
        };
        this.commandStack = [];
        this.lastCommandIndex = -1;
        this.modified = false;
        this.selectionSinceLastCommand = false;
        this.objectMap = {};
        this.containers = [this.headerBand, this.contentBand, this.footerBand];
        this.selections = [];
        this.reportKey = null;  // key of last report preview to allow download of xlsx file for this report

        this.browserDragType = '';
        this.browserDragCategory = '';
        this.browserDragId = '';

        this.documentProperties.setPanelItem(this.mainPanel.getDocumentPropertiesItem());
        this.initObjectMap();

        $(document).keydown(event => {
            // check metaKey instead of ctrl for Mac
            if (event.metaKey || event.ctrlKey) {
                switch (event.which) {
                    case 67: {
                        // Ctrl + C: copy
                        if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
                            let cleared = false;
                            for (let selectionId of this.selections) {
                                let obj = this.getDataObject(selectionId);
                                if (obj instanceof DocElement && !(obj instanceof TableTextElement)) {
                                    if (!cleared) {
                                        this.clipboardElements = [];
                                        cleared = true;
                                    }
                                    this.clipboardElements.push(obj.toJS());
                                }
                            }
                            event.preventDefault();
                        }
                        break;
                    }
                    case 86: {
                        // Ctrl + V: paste
                        if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
                            let cleared = false;
                            for (let clipboardElement of this.clipboardElements) {
                                clipboardElement.id = this.getUniqueId();
                                if (clipboardElement.elementType === DocElement.type.table) {
                                    TableElement.removeIds(clipboardElement);
                                }
                                clipboardElement.x = clipboardElement.y = 0;
                                this.createDocElement(clipboardElement, true);
                                this.selectObject(clipboardElement.id, !cleared);
                                cleared = true;
                            }
                            event.preventDefault();
                        }
                        break;
                    }
                    case 89: {
                        // Ctrl + Y: redo
                        this.redoCommand();
                        event.preventDefault();
                        break; 
                    }
                    case 90: {
                        // Ctrl + Z: undo
                        this.undoCommand();
                        event.preventDefault();
                        break;
                    }
                }
            } else {
                if (event.which === 27) {  // escape
                    this.popupWindow.hide();
                }
                else if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
                    switch (event.which) {
                        case 8:  // backspace
                        case 46: {  // delete
                            let cmdGroup = new CommandGroupCmd('Delete', this);
                            for (let selectionId of this.selections) {
                                let obj = this.getDataObject(selectionId);
                                if (obj instanceof DocElement) {
                                    let cmd = new AddDeleteDocElementCmd(false, obj.getPanelItem().getPanelName(),
                                        obj.toJS(), obj.getId(), obj.getContainerId(), obj.getPanelItem().getSiblingPosition(), this);
                                    cmdGroup.addCommand(cmd);
                                }
                            }
                            if (!cmdGroup.isEmpty()) {
                                this.executeCommand(cmdGroup);
                            }
                            event.preventDefault();
                            break;
                        }
                        case 37:  // left
                        case 38:  // up
                        case 39:  // right
                        case 40: {  // down
                            let cmdGroup = new CommandGroupCmd('Move element', this);
                            let tagId;
                            let field = (event.which === 37 || event.which === 39) ? 'x' : 'y';
                            let bandWidth = this.getDocumentProperties().getContentSize().width;
                            for (let selectionId of this.selections) {
                                let obj = this.getDataObject(selectionId);
                                if (obj instanceof DocElement) {
                                    if (event.which === 37 || event.which === 39) {
                                        tagId = obj.getXTagId();
                                    } else {
                                        tagId = obj.getYTagId();
                                    }
                                    if (tagId !== '') {
                                        let val = null;
                                        if (event.which === 37) {
                                            if (obj.getValue('xVal') > 0) {
                                                val = obj.getValue('xVal') - 1;
                                            }
                                        } else if (event.which === 38) {
                                            if (obj.getValue('yVal') > 0) {
                                                val = obj.getValue('yVal') - 1;
                                            }
                                        } else if (event.which === 39) {
                                            let containerSize = obj.getContainerSize();
                                            if ((obj.getValue('xVal') + obj.getValue('widthVal')) < containerSize.width) {
                                                val = obj.getValue('xVal') + 1;
                                            }
                                        } else if (event.which === 40) {
                                            let containerSize = obj.getContainerSize();
                                            if ((obj.getValue('yVal') + obj.getValue('heightVal')) < containerSize.height) {
                                                val = obj.getValue('yVal') + 1;											
                                            }
                                        }
                                        if (val !== null) {
                                            let cmd = new SetValueCmd(selectionId, tagId, field,
                                                val, SetValueCmd.type.text, this);
                                            cmdGroup.addCommand(cmd);
                                        }
                                    }
                                }
                            }
                            if (!cmdGroup.isEmpty()) {
                                this.executeCommand(cmdGroup);
                            }
                            event.preventDefault();
                            break;
                        }
                    }
                }
            }
        });
    }

    /**
     * Adds default parameters like page count/number.
     */
    addDefaultParameters() {
        for (let parameterData of [
                { name: 'page_count', type: Parameter.type.number, eval: false, editable: false, showOnlyNameType: true },
                { name: 'page_number', type: Parameter.type.number, eval: false, editable: false, showOnlyNameType: true }]) {
            let parameter = new Parameter(this.getUniqueId(), parameterData, this);
            let parentPanel = this.mainPanel.getParametersItem();
            let panelItem = new MainPanelItem('parameter', 'parameter', '',
                parentPanel, parameter, { hasChildren: false, showAdd: false, showDelete: false, draggable: false }, this);
            panelItem.openParentItems();
            parameter.setPanelItem(panelItem);
            parentPanel.appendChild(panelItem);
            parameter.setup();
            this.addParameter(parameter);
        }
    }

    render() {
        this.element.empty();
        if (this.getProperty('menuSidebar')) {
            this.element.addClass('rbroMenuPanelSidebar');
        }
        this.element.append('<div class="rbroLogo"></div>');
        this.element.append('<div class="rbroMenuPanel" id="rbro_menu_panel"></div>');
        this.element.append(
            `<div class="rbroContainer">
                <div class="rbroMainPanel" id="rbro_main_panel"><ul id="rbro_main_panel_list"></ul></div>
                <div class="rbroDetailPanel" id="rbro_detail_panel"></div>
                <div class="rbroDocumentPanel" id="rbro_document_panel"></div>
            </div>`);
        this.mainPanel.render();
        this.menuPanel.render();
        for (let panelName in this.detailPanels) {
            this.detailPanels[panelName].render();
        }
        this.detailPanels[this.activeDetailPanel].show(this.detailData);
        this.document.render();
        this.popupWindow.render();
        this.updateMenuButtons();

        $(document).mouseup(event => {
            if (this.document.isDragging()) {
                this.document.stopDrag();
            }
            this.popupWindow.hide();
        });
        this.element
            .on('dragstart', event => {
                // disable dragging per default, otherwise e.g. a text selection can be dragged in Chrome
                event.preventDefault();
           });
    }

    setup() {
        this.addDefaultParameters();
        this.headerBand.setup();
        this.contentBand.setup();
        this.footerBand.setup();
        this.documentProperties.setup();
    }

    initObjectMap() {
        this.addDataObject(this.headerBand);
        this.addDataObject(this.contentBand);
        this.addDataObject(this.footerBand);
        this.addDataObject(this.parameterContainer);
        this.addDataObject(this.styleContainer);
        this.addDataObject(this.documentProperties);
    }

    /**
     * Returns the label for given key.
     * @param {String} key
     * @returns {String} Label for given key, if it does not exist then the key is returned.
     */
    getLabel(key) {
        if (key in this.locale) {
            return this.locale[key];
        }
        return key;
    }

    getProperty(key) {
        return this.properties[key];
    }

    /**
     * Returns a new unique id which can be used for any data object.
     * @returns {Number}
     */
    getUniqueId() {
        return this.nextId++;
    }

    getMainPanel() {
        return this.mainPanel;
    }

    getDocument() {
        return this.document;
    }

    getPopupWindow() {
        return this.popupWindow;
    }

    getFonts() {
        return this.properties.fonts;
    }

    /**
     * Returns a list of all number and date patterns.
     * @returns {Object[]} Each item contains name (String), optional description (String) and optional separator (Boolean).
     */
    getPatterns() {
        let patterns = [];
        if (this.properties.patternNumbers.length > 0) {
            patterns.push({ separator: true, name: this.getLabel('patternSeparatorNumbers') });
            for (let pattern of this.properties.patternNumbers) {
                patterns.push(pattern);
            }
        }
        if (this.properties.patternDates.length > 0) {
            patterns.push({ separator: true, name: this.getLabel('patternSeparatorDates') });
            for (let pattern of this.properties.patternDates) {
                patterns.push(pattern);
            }
        }
        return patterns;
    }

    /**
     * Returns a list of parameter items.
     * Used for parameter popup window.
     * @param {DocElement} docElement - adds all parameters available for this element, e.g. array field parameters
     * of a table data source.
     * @param {String[]} allowedTypes - specify allowed parameter types which will be added to the
     * parameters list. If empty all parameter types are allowed.
     * @returns {Object[]} Each item contains name (String), optional description (String) and
     * optional separator (Boolean).
     */
    getParameterItems(docElement, allowedTypes) {
        let parameters = [];
        let parameterItems = this.getMainPanel().getParametersItem().getChildren();
        parameters.push({ separator: true, name: this.getLabel('parameters') });
        let panelItem = docElement.getPanelItem();
        while (panelItem !== null) {
            panelItem = panelItem.getParent();
            if (panelItem !== null && panelItem.getData() instanceof TableBandElement &&
                    panelItem.getData().getValue('tableBand') === 'content') {
                if (panelItem.getParent() !== null && panelItem.getParent().getData() instanceof TableElement) {
                    for (let dataParameter of panelItem.getParent().getData().getDataParameters()) {
                        dataParameter.appendParameterItems(parameters, allowedTypes);
                    }
                }
                break;
            }
        }
        let mapParameters = []; // add all parameters of collections at end of list with a header containing the collection name
        for (let parameterItem of parameterItems) {
            let parameter = parameterItem.getData();
            if (parameter.getValue('type') === Parameter.type.map) {
                parameter.appendParameterItems(mapParameters, allowedTypes);
            } else {
                parameter.appendParameterItems(parameters, allowedTypes);
            }
        }
        return parameters.concat(mapParameters);
    }

    /**
     * Returns a list of all array parameter items.
     * Used for parameter popup window.
     * @returns {Object[]} Each item contains name (String), optional description (String) and
     * optional separator (Boolean).
     */
    getArrayParameterItems() {
        let parameters = [];
        let parameterItems = this.getMainPanel().getParametersItem().getChildren();
        parameters.push({ separator: true, name: this.getLabel('parameters') });
        for (let parameterItem of parameterItems) {
            let parameter = parameterItem.getData();
            if (parameter.getValue('type') === Parameter.type.array) {
                parameters.push({ name: parameter.getName(), description: '' });
            }
        }
        return parameters;
    }

    /**
     * Returns a list of all array field parameter items.
     * Used for parameter popup window.
     * @param {String} fieldType - allowed parameter type which will be added to the
     * parameter list. If empty all parameter types are allowed.
     * @returns {Object[]} Each item contains name (String), optional description (String) and
     * optional separator (Boolean).
     */
    getArrayFieldParameterItems(fieldType) {
        let parameters = [];
        let parameterItems = this.getMainPanel().getParametersItem().getChildren();
        parameters.push({ separator: true, name: this.getLabel('parameters') });
        for (let parameterItem of parameterItems) {
            let parameter = parameterItem.getData();
            if (parameter.getValue('type') === Parameter.type.array) {
                parameter.appendFieldParameterItems(parameters, fieldType);
            }
        }
        return parameters;
    }

    getParameterByName(parameterName) {
        let parameters = this.getParameters();
        for (let parameter of parameters) {
            if (parameter.getValue('name') === parameterName) {
                return parameter;
            }
        }
        return null;
    }

    getDocElements() {
        let docElements = [];
        for (let i=0; i < this.docElements.length; i++) {
            let docElement = this.docElements[i];
            docElements.push(docElement);
            docElement.addChildren(docElements);
        }
        return docElements;
    }

    setDetailPanel(panelName, data) {
        this.detailPanels[this.activeDetailPanel].hide();
        this.activeDetailPanel = panelName;
        this.detailData = data;
        this.detailPanels[panelName].show(data);
    }

    updateDetailPanel() {
        this.detailPanels[this.activeDetailPanel].updateData(this.detailData);
    }

    /**
     * Is called when a data object was modified (including new and deleted data objects).
     * @param {*} obj - new/deleted/modified data object.
     * @param {String} operation - operation which caused the notification.
     * @param {[String]} field - affected field in case of change operation.
     */
    notifyEvent(obj, operation, field) {
        if (obj instanceof Parameter) {
            if (obj.getValue('type') === Parameter.type.array || obj.getValue('type') === Parameter.type.map) {
                $(`#rbro_menu_item_add${obj.getId()}`).show();
                $(`#rbro_menu_item_children${obj.getId()}`).show();
                $(`#rbro_menu_item_children_toggle${obj.getId()}`).show();
            } else {
                $(`#rbro_menu_item_add${obj.getId()}`).hide();
                $(`#rbro_menu_item_children${obj.getId()}`).hide();
                $(`#rbro_menu_item_children_toggle${obj.getId()}`).hide();
            }
        } else if (obj instanceof Style) {
            for (let docElement of this.docElements) {
                docElement.updateChangedStyle(obj.getId());
            }
            
        }
        for (let panelName in this.detailPanels) {
            this.detailPanels[panelName].notifyEvent(obj, operation);
        }
    }	

    addParameter(parameter) {
        this.addDataObject(parameter);
    }

    deleteParameter(parameter) {
        this.deleteDataObject(parameter);
    }

    addStyle(style) {
        this.addDataObject(style);
        this.notifyEvent(style, Command.operation.add);
    }

    deleteStyle(style) {
        this.deleteDataObject(style);
        this.notifyEvent(style, Command.operation.remove);
    }

    getStyles() {
        let styles = [];
        for (let styleItem of this.getMainPanel().getStylesItem().getChildren()) {
            styles.push(styleItem.getData());
        }
        return styles;
    }

    getParameters() {
        let parameters = [];
        for (let parameterItem of this.getMainPanel().getParametersItem().getChildren()) {
            parameters.push(parameterItem.getData());
        }
        return parameters;
    }

    addDocElement(element) {
        this.docElements.push(element);
        this.addDataObject(element);
    }

    deleteDocElement(element) {
        for (let i=0; i < this.docElements.length; i++) {
            if (this.docElements[i].getId() === element.getId()) {
                if (this.detailData === this.docElements[i]) {
                    this.setDetailPanel('none', null);
                }
                this.docElements.splice(i, 1);
                this.deleteDataObject(element);
                break;
            }
        }
    }

    getDetailData() {
        return this.detailData;
    }

    getDocumentProperties() {
        return this.documentProperties;
    }

    executeCommand(cmd) {
        cmd.do();
        if (this.lastCommandIndex < (this.commandStack.length - 1)) {
            this.commandStack = this.commandStack.slice(0, this.lastCommandIndex + 1);
        }
        if (!this.selectionSinceLastCommand && cmd instanceof SetValueCmd && this.commandStack.length > 0) {
            // if previous and current command are both SetValueCmds and target the same text field,
            // we can discard the previous command and only keep the latest update
            let prevCmd = this.commandStack[this.commandStack.length - 1];
            if (prevCmd instanceof SetValueCmd && prevCmd.allowReplace(cmd)) {
                cmd.oldValue = prevCmd.oldValue;
                this.commandStack = this.commandStack.slice(0, this.commandStack.length - 1);
                this.lastCommandIndex--;
            }
        }
        this.commandStack.push(cmd);
        this.lastCommandIndex++;
        this.modified = true;
        this.selectionSinceLastCommand = false;
        this.updateMenuButtons();
    }

    undoCommand() {
        if (this.lastCommandIndex >= 0) {
            this.commandStack[this.lastCommandIndex].undo();
            this.lastCommandIndex--;
            this.modified = true;
            this.updateMenuButtons();
        }
    }

    redoCommand() {
        if (this.lastCommandIndex < (this.commandStack.length - 1)) {
            this.lastCommandIndex++;
            this.commandStack[this.lastCommandIndex].do();
            this.modified = true;
            this.updateMenuButtons();
        }
    }

    updateMenuButtons() {
        $('#rbro_menu_save').prop('disabled', (this.commandStack.length === 0 || !this.modified));
        $('#rbro_menu_undo').prop('disabled', (this.lastCommandIndex < 0));
        $('#rbro_menu_redo').prop('disabled', (this.lastCommandIndex >= (this.commandStack.length - 1)));
    }

    updateMenuAlignButtons() {
        let elementCount = 0;
        let previousContainerId = '';
        let elementDifferentContainers = false;
        for (let selectionId of this.selections) {
            let obj = this.getDataObject(selectionId);
            if (obj instanceof DocElement && obj.getXTagId() !== '') {
                elementCount++;
                if (elementCount === 1) {
                    previousContainerId = obj.getValue('containerId');
                } else {
                    if (previousContainerId !== obj.getValue('containerId')) {
                        elementDifferentContainers = true;
                    }
                }
            }
        }
        if (elementCount > 1) {
            $('#rbro_menu_align').show();
            if (elementDifferentContainers) {
                $('#rbro_menu_valign').hide();
            } else {
                $('#rbro_menu_valign').show();
            }
        } else {
            $('#rbro_menu_align').hide();
            $('#rbro_menu_valign').hide();
        }
    }

    debugCommandStack() {
        console.clear();		
        for (let i=0; i < this.commandStack.length; i++) {
            if (i > this.lastCommandIndex) {
                console.log('( ' + i + ' ' + this.commandStack[i].getName() + ' )');
            } else {
                console.log(i + ' ' + this.commandStack[i].getName());
            }
        }
    }

    addDataObject(obj) {
        this.objectMap[obj.getId()] = obj;
    }

    deleteDataObject(obj) {
        if (this.isSelectedObject(obj.getId())) {
            this.deselectObject(obj.getId());
        }
        if (obj.getId() in this.objectMap) {
            obj.remove();
            delete this.objectMap[obj.getId()];
        }
    }

    getDataObject(id) {
        if (id !== null && id in this.objectMap) {
            return this.objectMap[id];
        }
        return null;
    }

    isSelectedObject(id) {
        return this.selections.indexOf(id) !== -1;
    }

    isDocElementSelected() {
        for (let selectionId of this.selections) {
            let obj = this.getDataObject(selectionId);
            if (obj instanceof DocElement) {
                return true;
            }
        }
        return false;
    }

    isTableElementSelected(tableId) {
        for (let selectionId of this.selections) {
            let obj = this.getDataObject(selectionId);
            if (obj instanceof TableTextElement) {
                if (obj.getValue('tableId') === tableId) {
                    return true;
                }
            }
        }
        return false;
    }

    selectObject(id, clearSelection) {
        if (clearSelection) {
            this.deselectAll();
        }
        let obj = this.getDataObject(id);
        if (obj !== null) {
            this.selections.push(id);
            obj.select();
            if (obj.getPanelItem() !== null) {
                obj.getPanelItem().openParentItems();
                obj.getPanelItem().setActive();
            }
        }
        this.selectionSinceLastCommand = true;
        this.updateMenuAlignButtons();
    }

    deselectObject(id) {
        this.deselectObjectInternal(id, true);
        this.updateMenuAlignButtons();
    }

    deselectObjectInternal(id, updateSelections) {
        let obj = this.getDataObject(id);
        if (obj !== null) {
            obj.deselect();
            if (this.detailData === obj) {
                this.setDetailPanel('none', null);
                $('.rbroMenuItem').removeClass('rbroMenuItemActive');
            }
        }
        if (updateSelections) {
            let selectionIndex = this.selections.indexOf(id);
            if (selectionIndex !== -1) {
                this.selections.splice(selectionIndex, 1);
            }
        }
    }

    deselectAll() {
        for (let selectionId of this.selections) {
            this.deselectObjectInternal(selectionId, false);
        }
        this.selections = [];
        this.updateMenuAlignButtons();
    }

    getContainer(posX, posY) {
        for (let i = this.containers.length - 1; i >= 0; i--) {
            let container = this.containers[i];
            if (container.isInside(posX, posY)) {
                return container;
            }
        }
        return null;
    }

    /**
     * Store our own drag data because dataTransfer data of event is not available in
     * dragenter/dragover/dragleave events (in some browsers).
     */
    startBrowserDrag(browserDragType, browserDragCategory, browserDragElementType, browserDragId) {
        this.browserDragType = browserDragType;
        this.browserDragCategory = browserDragCategory;
        this.browserDragId = browserDragId;
        this.getDocument().startBrowserDrag(browserDragElementType);
    }

    isBrowserDragActive(browserDragType) {
        return this.browserDragType === browserDragType;
    }

    getBrowserDragCategory() {
        return this.browserDragCategory;
    }

    getBrowserDragId() {
        return this.browserDragId;
    }

    updateSelectionDrag(diffX, diffY, dragType, dragContainer, snapToGrid, store) {
        let cmdGroup;
        if (store) {
            cmdGroup = new CommandGroupCmd(dragType === DocElement.dragType.element ? 'Update position' : 'Resize', this);
        }
        let gridSize = 0;
        if (snapToGrid && this.document.isGridVisible()) {
            gridSize = this.document.getGridSize();
        }
        for (let selectionId of this.selections) {
            let obj = this.getDataObject(selectionId);
            if (obj !== null) {
                if (dragType !== DocElement.dragType.element || obj.isDraggingAllowed()) {
                    obj.updateDrag(diffX, diffY, dragType, dragContainer, gridSize, store ? cmdGroup : null);
                }
            }
        }
        if (store && !cmdGroup.isEmpty()) {
            this.executeCommand(cmdGroup);
        }
    }

    /**
     * Aligns all currently selected doc elements to each other.
     * @param {Style.alignment} alignment
     */
    alignSelections(alignment) {
        let alignVal = NaN;
        let x, y, width, height;
        let minX = Number.MAX_VALUE, maxX = Number.MIN_VALUE, minY = Number.MAX_VALUE, maxY = Number.MIN_VALUE;
        let elementCount = 0;
        for (let selectionId of this.selections) {
            let obj = this.getDataObject(selectionId);
            if (obj instanceof DocElement && obj.getXTagId() !== '') {
                elementCount++;
                x = obj.getValue('xVal');
                y = obj.getValue('yVal');
                width = obj.getValue('widthVal');
                height = obj.getValue('heightVal');
                if (x < minX) {
                    minX = x;
                }
                if ((x + width) > maxX) {
                    maxX = x + width;
                }
                if (y < minY) {
                    minY = y;
                }
                if ((y + height) > maxY) {
                    maxY = y + height;
                }
            }
        }
        let center = minX + ((maxX - minX) / 2);
        let vcenter  = minY + ((maxY - minY) / 2);
        if (elementCount > 1) {
            let cmdGroup = new CommandGroupCmd('Align elements', this);
            for (let selectionId of this.selections) {
                let obj = this.getDataObject(selectionId);
                if (obj instanceof DocElement && !(obj instanceof PageBreakElement)) {
                    switch (alignment) {
                        case Style.alignment.left: {
                            let cmd = new SetValueCmd(obj.getId(), obj.getXTagId(), 'x',
                                '' + minX, SetValueCmd.type.text, this);
                            cmdGroup.addCommand(cmd);
                        }
                        break;
                        case Style.alignment.center: {
                            let cmd = new SetValueCmd(obj.getId(), obj.getXTagId(), 'x',
                                '' + (center - (obj.getValue('widthVal') / 2)), SetValueCmd.type.text, this);
                            cmdGroup.addCommand(cmd);
                        }
                        break;
                        case Style.alignment.right: {
                            let cmd = new SetValueCmd(obj.getId(), obj.getXTagId(), 'x',
                                '' + (maxX - obj.getValue('widthVal')), SetValueCmd.type.text, this);
                            cmdGroup.addCommand(cmd);
                        }
                        break;
                        case Style.alignment.top: {
                            let cmd = new SetValueCmd(obj.getId(), obj.getYTagId(), 'y',
                                '' + minY, SetValueCmd.type.text, this);
                            cmdGroup.addCommand(cmd);
                        }
                        break;
                        case Style.alignment.middle: {
                            let cmd = new SetValueCmd(obj.getId(), obj.getYTagId(), 'y',
                                '' + (vcenter - (obj.getValue('heightVal') / 2)), SetValueCmd.type.text, this);
                            cmdGroup.addCommand(cmd);
                        }
                        break;
                        case Style.alignment.bottom: {
                            let cmd = new SetValueCmd(obj.getId(), obj.getYTagId(), 'y',
                                '' + (maxY - obj.getValue('heightVal')), SetValueCmd.type.text, this);
                            cmdGroup.addCommand(cmd);
                        }
                        break;
                    }
                }
            }
            this.executeCommand(cmdGroup);
        }
    }

    /**
     * Converts given value to a string which can be used in css style attribute
     * where a position or size must be specified.
     * @param {String|Number} val - a number value, can also be given as a string.
     * @returns {String}
     */
    toPixel(val) {
        if (val === '') {
            return '0px';
        }
        if ($.type(val) === 'string') {
            val = parseFloat(val.replace(',', '.'));
            if (val === NaN) {
                return '0px';
            }
        }
        return val + 'px';
    }

    createDocElement(docElementData, openParentItems) {
        let properties = { draggable: true };
        let element = null;
        if (docElementData.elementType === DocElement.type.text) {
            element = new TextElement(docElementData.id, docElementData, this);
        } else if (docElementData.elementType === DocElement.type.line) {
            element = new LineElement(docElementData.id, docElementData, this);
        } else if (docElementData.elementType === DocElement.type.image) {
            element = new ImageElement(docElementData.id, docElementData, this);
        } else if (docElementData.elementType === DocElement.type.pageBreak) {
            element = new PageBreakElement(docElementData.id, docElementData, this);
        } else if (docElementData.elementType === DocElement.type.table) {
            element = new TableElement(docElementData.id, docElementData, this);
            properties.hasChildren = true;
        } else if (docElementData.elementType === DocElement.type.barCode) {
            element = new BarCodeElement(docElementData.id, docElementData, this);
        }
        this.addDocElement(element);
        let parentPanel = element.getContainer().getPanelItem();
        let panelItem = new MainPanelItem(docElementData.elementType, 'docElement', '',
            parentPanel, element, properties, this);
        if (openParentItems) {
            panelItem.openParentItems();
        }
        element.setPanelItem(panelItem);
        parentPanel.appendChild(panelItem);
        element.setup();
        return element;
    }

    /**
     * Shows a global loading image which disables all controls.
     */
    showLoading() {
        if ($('#rbro_loading_div').length == 0) {
            $('body').append('<div id="rbro_loading_div" class="rbroLoadingIndicator"></div>');
        }
    }

    /**
     * Hides global loading image.
     */
    hideLoading() {
        $('#rbro_loading_div').remove();
    }

    getTestData() {
        let ret = {};
        for (let parameter of this.getParameters()) {
            if (!parameter.getValue('showOnlyNameType')) {
                let type = parameter.getValue('type');
                if (type === Parameter.type.map) {
                    let testData = {};
                    for (let child of parameter.getChildren()) {
                        testData[child.getName()] = child.getValue('testData');
                    }
                    ret[parameter.getName()] = testData;
                } else if (type === Parameter.type.array) {
                    ret[parameter.getName()] = parameter.getTestDataRows();
                } else if (type === Parameter.type.string || type === Parameter.type.number || type === Parameter.type.date) {
                    ret[parameter.getName()] = parameter.getValue('testData');
                }
            }
        }
        return ret;
    }

    processErrors(errors) {
        for (let error of errors) {
            if (error.object_id) {
                $(`#rbro_menu_item${error.object_id}`).addClass('rbroError');
                let obj = this.getDataObject(error.object_id);
                if (obj !== null) {
                    obj.addError(error);
                }
            }
        }
        if (errors.length > 0) {
            this.detailPanels[this.activeDetailPanel].updateErrors();
            this.selectObject(errors[0].object_id, true);
        }
    }

    /**
     * Performs ajax request to upload the report and either update displayed errors or
     * display report pdf in case report is valid.
     * @param {Object} data - report data.
     * @param {Boolean} isTestData - true if data contains test data from parameters.
     */
    previewInternal(data, isTestData) {
        let self = this;
        $('.rbroMenuItem').removeClass('rbroError');
        for (let objId in this.objectMap) {
            this.objectMap[objId].clearErrors();
        }
        this.detailPanels[this.activeDetailPanel].updateErrors();
        this.showLoading();
        $.ajax(this.properties.reportServerUrl, {
            data: JSON.stringify({
                report: this.getReport(),
                outputFormat: DocumentProperties.outputFormat.pdf,
                data: data,
                isTestData: isTestData
            }),
            type: "PUT", contentType: "application/json",
            timeout: this.properties.reportServerTimeout,
            crossDomain: this.properties.reportServerUrlCrossDomain,
            success: function(data) {
                self.hideLoading();
                let pdfPrefix = 'data:application/pdf';
                if (data.substr(0, 4) === 'key:') {
                    self.reportKey = data.substr(4);
                    self.getDocument().openPdfPreviewTab(self.properties.reportServerUrl + '?key=' + self.reportKey + '&outputFormat=pdf');
                } else {
                    self.reportKey = null;
                    try {
                        let obj = JSON.parse(data);
                        if (obj.errors.length > 0) {
                            self.processErrors(obj.errors);
                        }
                    } catch (e) {
                        alert('preview failed');
                    }
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                self.hideLoading();
                if (textStatus === "timeout") {
                    alert('preview failed (timeout)');
                } else {
                    alert('preview failed');
                }
            }
        });
    }

    ///////////////////////////////////////////////////////////////////////////
    // API functions
    ///////////////////////////////////////////////////////////////////////////
    
    /**
     * Returns report object containing everything needed for the report.
     * @returns {Object}
     */
    getReport() {
        let ret = { docElements: [], parameters: [], styles: [], version: 1 };
        let i;
        let existingIds = {};
        for (i=0; i < this.docElements.length; i++) {
            let docElement = this.docElements[i];
            if (!(docElement.getId() in existingIds)) {
                existingIds[docElement.getId()] = true;
                ret.docElements.push(docElement.toJS());
            }
        }
        for (let parameter of this.getParameters()) {
            ret.parameters.push(parameter.toJS());
        }
        for (let style of this.getStyles()) {
            ret.styles.push(style.toJS());
        }
        ret.documentProperties = this.documentProperties.toJS();
        
        return ret;
    }

    /**
     * Either calls saveCallback (if available) or stores report in local storage (if key is available).
     */
    save() {
        if (this.properties.saveCallback) {
            this.properties.saveCallback();
            this.modified = false;
        } else if (this.properties.localStorageReportKey) {
            if ('localStorage' in window && window['localStorage'] !== null) {
                try {
                    let report = this.getReport();
                    // console.log(JSON.stringify(report));
                    window.localStorage.setItem(this.properties.localStorageReportKey, JSON.stringify(report));
                    this.modified = false;
                } catch (e) {
                }
            }
        }
        this.updateMenuButtons();
    }

    /**
     * Loads report object into ReportBro Designer.
     * @param {Object} report - the report object.
     */
    load(report) {
        for (let parameter of this.getParameters()) {
            this.deleteParameter(parameter);
        }
        for (let style of this.getStyles()) {
            this.deleteStyle(style);
        }
        
        this.nextId = 1;
        this.setDetailPanel('none', null);
        this.docElements = [];
        this.objectMap = {};
        this.initObjectMap();
        this.selections = [];
        this.getMainPanel().clearAll();
        this.getMainPanel().getHeaderItem().close();
        this.getMainPanel().getDocumentItem().close();
        this.getMainPanel().getFooterItem().close();
        this.getMainPanel().getParametersItem().close();
        this.getMainPanel().getStylesItem().close();

        this.documentProperties.setInitialData(report.documentProperties);
        this.documentProperties.setup();

        for (let styleData of report.styles) {
            let style = new Style(styleData.id, styleData, this);
            let parentPanel = this.mainPanel.getStylesItem();
            let panelItem = new MainPanelItem('style', 'style', '', parentPanel, style, { draggable: true }, this);
            style.setPanelItem(panelItem);
            parentPanel.appendChild(panelItem);
            this.addStyle(style);
            if (styleData.id >= this.nextId) {
                this.nextId = styleData.id + 1;
            }
        }
        for (let parameterData of report.parameters) {
            let parameter = new Parameter(parameterData.id, parameterData, this);
            let parentPanel = this.mainPanel.getParametersItem();
            let panelItem = new MainPanelItem('parameter', 'parameter', '',
                parentPanel, parameter, { hasChildren: true, showAdd: parameter.getValue('editable'),
                showDelete: parameter.getValue('editable'), draggable: true }, this);
            parameter.setPanelItem(panelItem);
            parentPanel.appendChild(panelItem);
            parameter.setup();
            if (parameter.getValue('type') !== Parameter.type.array && parameter.getValue('type') !== Parameter.type.map) {
                $(`#rbro_menu_item_add${parameter.getId()}`).hide();
                $(`#rbro_menu_item_children${parameter.getId()}`).hide();
                $(`#rbro_menu_item_children_toggle${parameter.getId()}`).hide();
            }
            this.addParameter(parameter);
            let maxId = parameter.getMaxId();
            if (maxId >= this.nextId) {
                this.nextId = maxId + 1;
            }
        }
        for (let docElementData of report.docElements) {
            let element = this.createDocElement(docElementData, false);
            let maxId = element.getMaxId();
            if (maxId >= this.nextId) {
                this.nextId = maxId + 1;
            }
        }

        this.browserDragType = '';
        this.browserDragCategory = '';
        this.browserDragId = '';

        this.commandStack = [];
        this.lastCommandIndex = -1;
        this.modified = false;
        this.updateMenuButtons();
    }

    /**
     * Loads report from local storage (if key and report is available).
     */
    loadLocalReport() {
        if (this.properties.localStorageReportKey) {
            if ('localStorage' in window && window['localStorage'] !== null) {
                let report = null;
                try {
                    report = JSON.parse(window.localStorage[this.properties.localStorageReportKey]);
                } catch (e) {
                }
                if (report !== null) {
                    this.load(report);
                }
            }
        }
    }
  
    preview() {
        this.previewInternal(this.getTestData(), true);
    }

    previewWithData(data) {
        this.previewInternal(data, false);
    }

    /**
     * Downloads spreadsheet file for a report where a preview was executed before.
     */
    downloadSpreadsheet() {
        if (this.reportKey !== null) {
            window.open(this.properties.reportServerUrl + '?key=' + this.reportKey + '&outputFormat=xlsx', '_blank');
        }
    }
}
