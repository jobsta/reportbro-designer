import Document from './Document';
import PopupWindow from './PopupWindow';
import AddDeleteDocElementCmd from './commands/AddDeleteDocElementCmd';
import AddDeleteParameterCmd from './commands/AddDeleteParameterCmd';
import AddDeleteStyleCmd from './commands/AddDeleteStyleCmd';
import Command from './commands/Command';
import CommandGroupCmd from './commands/CommandGroupCmd';
import SetValueCmd from './commands/SetValueCmd';
import Band from './container/Band';
import Container from './container/Container';
import Page from './container/Page';
import DocumentProperties from './data/DocumentProperties';
import Parameter from './data/Parameter';
import Style from './data/Style';
import DocElement from './elements/DocElement';
import FrameElement from './elements/FrameElement';
import PageBreakElement from './elements/PageBreakElement';
import SectionElement from './elements/SectionElement';
import TableElement from './elements/TableElement';
import TableTextElement from './elements/TableTextElement';
import locales from './i18n/locales';
import DocElementPanel from './panels/DocElementPanel';
import DocumentPropertiesPanel from './panels/DocumentPropertiesPanel';
import EmptyDetailPanel from './panels/EmptyDetailPanel';
import ParameterPanel from './panels/ParameterPanel';
import StylePanel from './panels/StylePanel';
import MainPanel from './menu/MainPanel';
import MainPanelItem from './menu/MainPanelItem';
import MenuPanel from './menu/MenuPanel';
import * as utils from './utils';

/**
 * Used for the main ReportBro instance.
 * @class
 */
export default class ReportBro {
    constructor(element, properties) {
        this.element = element;
        this.nextId = 1;
        this.locale = locales[(properties && properties.localeKey) || 'en_us'];
        if (properties && properties['locale']) {
            Object.assign(this.locale, properties['locale']);
        }

        this.properties = {
            additionalFonts: [],
            adminMode: true,
            autoSaveOnPreview: false,
            cmdExecutedCallback: null,
            colors: [
                "#000000","#444444","#666666","#999999","#cccccc","#eeeeee","#f3f3f3","#ffffff",
                "#ff0000","#ff9900","#ffff00","#00ff00","#00ffff","#0000ff","#9900ff","#ff00ff",
                "#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd",
                "#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0",
                "#cc0000","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79",
                "#990000","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47",
                "#660000","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"
            ],
            defaultFont: Style.font.helvetica,
            enableSpreadsheet: true,
            fontSizes: [4,5,6,7,8,9,10,11,12,13,14,15,16,18,20,22,24,26,28,32,36,40,44,48,54,60,66,72,80],
            fonts: [
                { name: 'Courier', value: Style.font.courier },
                { name: 'Helvetica', value: Style.font.helvetica },
                { name: 'Times New Roman', value: Style.font.times }
            ],
            highlightUnusedParameters: false,
            imageLimit: null,
            imageMaxSize: null,
            imageRequireWebPFormat: false,
            localStorageReportKey: null,
            menuShowButtonLabels: false,
            menuShowDebug: false,
            menuSidebar: false,
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
            patternNumberGroupSymbol: '',
            patternNumbers: [
                { name: '#,##0', description: this.locale['patternNumber1'] },
                { name: '0.000', description: this.locale['patternNumber2'] },
                { name: '0.00##', description: this.locale['patternNumber3'] },
                { name: '#,##0.00', description: this.locale['patternNumber4'] },
                { name: '$ #,##0.00', description: this.locale['patternNumber5'] }
            ],
            reportServerBasicAuth: null,
            reportServerHeaders: {},
            reportServerTimeout: 20000,
            reportServerUrl: 'https://www.reportbro.com/report/run',
            reportServerUrlCrossDomain: false,
            requestCallback: null,
            saveCallback: null,
            selectCallback: null,
            showGrid: true,
            showPlusFeatures: true,
            showPlusFeaturesInfo: true,
            theme: ''
        };
        if (properties) {
            for (let prop in properties) {
                if (this.properties.hasOwnProperty(prop)) {
                    this.properties[prop] = properties[prop];
                }
            }
        }
        if (this.properties.additionalFonts.length > 0) {
            this.properties.fonts = this.properties.fonts.concat(this.properties.additionalFonts);
        }
        // make sure defaultFont is available, otherwise use first entry of font list
        let defaultFontExists = false;
        for (let font of this.properties.fonts) {
            if (this.properties.defaultFont === font.value) {
                defaultFontExists = true;
                break;
            }
        }
        if (!defaultFontExists) {
            if (this.properties.fonts.length > 0) {
                this.properties.defaultFont = this.properties.fonts[0].value;
            } else {
                this.properties.defaultFont = '';
            }
        }

        if (this.properties.patternAdditionalDates.length > 0) {
            this.properties.patternDates = this.properties.patternDates.concat(this.properties.patternAdditionalDates);
        }
        if (this.properties.patternAdditionalNumbers.length > 0) {
            this.properties.patternNumbers =
                this.properties.patternNumbers.concat(this.properties.patternAdditionalNumbers);
        }

        if (!this.validateProperties(this.properties)) {
            throw 'Invalid properties for ReportBro instance, check console error log for further details';
        }

        this.document = new Document(element, this.properties.showGrid, this);
        this.popupWindow = new PopupWindow(element, this);
        this.docElements = [];
        this.headerBand = new Band(Band.bandType.header, false, '', '', this);
        this.contentBand = new Band(Band.bandType.content, false, '', '', this);
        this.footerBand = new Band(Band.bandType.footer, false, '', '', this);
        this.parameterContainer = new Container('0_parameters', this.getLabel('parameters'), this);
        this.styleContainer = new Container('0_styles', this.getLabel('styles'), this);
        this.watermarkTextContainer = new Page('0_watermark_texts', this.getLabel('watermarkTexts'), this);
        this.watermarkImageContainer = new Page('0_watermark_images', this.getLabel('watermarkImages'), this);
        this.documentProperties = new DocumentProperties(this);
        this.clipboardElements = [];

        this.mainPanel = new MainPanel(
            element, this.headerBand, this.contentBand, this.footerBand,
            this.parameterContainer, this.styleContainer, this);
        this.menuPanel = new MenuPanel(element, this);
        this.activeDetailPanel = 'none';
        this.detailPanels = {
            'none': new EmptyDetailPanel(element, this),
            'docElement': new DocElementPanel(element, this),
            'parameter': new ParameterPanel(element, this),
            'style': new StylePanel(element, this),
            'documentProperties': new DocumentPropertiesPanel(element, this)
        };

        this.commandStack = [];
        this.lastCommandIndex = -1;
        this.savedCommandIndex = -1;
        this.modified = false;
        this.selectionSinceLastCommand = false;
        this.objectMap = {};
        this.containers = [this.headerBand, this.contentBand, this.footerBand];
        this.selections = [];
        this.reportKey = null;  // key of last report preview to allow download of xlsx file for this report

        this.browserDragType = '';
        this.browserDragId = '';

        this.documentProperties.setPanelItem(this.mainPanel.getDocumentPropertiesItem());
        this.initObjectMap();

        this.keydownEventListener = (event) => {
            if (this.detailPanels[this.activeDetailPanel].isKeyEventDisabled()) {
                return;
            }

            // check metaKey instead of ctrl for Mac
            if (event.metaKey || event.ctrlKey) {
                switch (event.which) {
                    case 67: {
                        // Ctrl + C: copy
                        if (!(event.target instanceof HTMLInputElement ||
                                event.target instanceof HTMLTextAreaElement)) {
                            let cleared = false;
                            let idMap = {};
                            let serializedObj;
                            let i;
                            for (let selectionId of this.selections) {
                                let obj = this.getDataObject(selectionId);
                                if ((obj instanceof DocElement && !(obj instanceof TableTextElement)) ||
                                        (obj instanceof Parameter && !obj.showOnlyNameType) ||
                                        (obj instanceof Style)) {
                                    if (!cleared) {
                                        this.clipboardElements = [];
                                        cleared = true;
                                    }
                                    if (!(obj.getId() in idMap)) {
                                        idMap[obj.getId()] = true;
                                        serializedObj = obj.toJS();
                                        this.clipboardElements.push(serializedObj);
                                        if (obj instanceof DocElement) {
                                            serializedObj.baseClass = 'DocElement';
                                            if (obj instanceof FrameElement) {
                                                let nestedElements = [];
                                                obj.appendContainerChildren(nestedElements);
                                                for (let nestedElement of nestedElements) {
                                                    if (nestedElement.getId() in idMap) {
                                                        // in case a nested element is also selected we make sure
                                                        // to add it only once to the clipboard objects and to
                                                        // add it after its parent element
                                                        for (i = 0; i < this.clipboardElements.length; i++) {
                                                            if (nestedElement.getId() === this.clipboardElements[i].id) {
                                                                this.clipboardElements.splice(i, 1);
                                                                break;
                                                            }
                                                        }
                                                    } else {
                                                        idMap[nestedElement.getId()] = true;
                                                    }
                                                    serializedObj = nestedElement.toJS();
                                                    serializedObj.baseClass = 'DocElement';
                                                    this.clipboardElements.push(serializedObj);
                                                }
                                            }
                                        } else if (obj instanceof Parameter) {
                                            serializedObj.baseClass = 'Parameter';
                                        } else if (obj instanceof Style) {
                                            serializedObj.baseClass = 'Style';
                                        }
                                    }
                                }
                            }
                            event.preventDefault();
                        }
                        break;
                    }
                    case 86: {
                        // Ctrl + V: paste
                        if (!(event.target instanceof HTMLInputElement ||
                                event.target instanceof HTMLTextAreaElement)) {
                            let cmd;
                            let cmdGroup = new CommandGroupCmd('Paste from clipboard', this);
                            let mappedContainerIds = {};
                            let pastedElements = [];
                            for (let clipboardElement of this.clipboardElements) {
                                // create new pasted element to change properties (id, name, etc.) and
                                // leave clipboard elements unchanged
                                let pastedElement = Object.assign({}, clipboardElement);
                                pastedElement.id = this.getUniqueId();
                                pastedElements.push(pastedElement);

                                if (pastedElement.baseClass === 'DocElement') {
                                    if (pastedElement.linkedContainerId) {
                                        let linkedContainerId = this.getUniqueId();
                                        mappedContainerIds[pastedElement.linkedContainerId] = linkedContainerId;
                                        pastedElement.linkedContainerId = linkedContainerId;
                                    }
                                    if (pastedElement.elementType === DocElement.type.table) {
                                        TableElement.removeIds(pastedElement);
                                    }
                                }
                            }
                            for (let pastedElement of pastedElements) {
                                if (pastedElement.baseClass === 'DocElement') {
                                    // map id of container in case element is inside other pasted container (frame/band)
                                    if (pastedElement.containerId in mappedContainerIds) {
                                        pastedElement.containerId = mappedContainerIds[pastedElement.containerId];
                                        // since element is inside pasted container we can keep x/y coordinates
                                    } else {
                                        let pasteToY = 0;
                                        let container = this.getDataObject(pastedElement.containerId);
                                        if (container !== null) {
                                            // determine new y-coord so pasted element is in
                                            // visible area of scrollable document
                                            let containerOffset = container.getOffset();
                                            let containerSize = container.getContentSize();
                                            let contentScrollY = this.getDocument().getContentScrollPosY();
                                            if (contentScrollY > containerOffset.y &&
                                                    (contentScrollY + pastedElement.height) <
                                                    (containerOffset.y + containerSize.height)) {
                                                pasteToY = contentScrollY - containerOffset.y;
                                            }
                                        }
                                        pastedElement.x = 0;
                                        pastedElement.y = pasteToY;
                                    }
                                    cmd = new AddDeleteDocElementCmd(
                                        true, pastedElement.elementType, pastedElement,
                                        pastedElement.id, pastedElement.containerId, -1, this);
                                    cmdGroup.addCommand(cmd);

                                } else if (pastedElement.baseClass === 'Parameter' ||
                                        pastedElement.baseClass === 'Style') {
                                    // try to find unique name for pasted element by using a suffix
                                    let copySuffix = this.getLabel('nameCopySuffix');
                                    let pastedElementName = pastedElement.name + ` (${copySuffix})`;
                                    let panelItem = (pastedElement.baseClass === 'Parameter') ?
                                        this.parameterContainer.getPanelItem() : this.styleContainer.getPanelItem();
                                    if (panelItem !== null) {
                                        if (panelItem.getChildByName(pastedElementName)) {
                                            for (let paramNr = 2; paramNr <= 99; paramNr++) {
                                                pastedElementName = pastedElement.name + ` (${copySuffix} ${paramNr})`;
                                                if (panelItem.getChildByName(pastedElementName) === null) {
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    pastedElement.name = pastedElementName;

                                    if (pastedElement.baseClass === 'Parameter') {
                                        Parameter.removeIds(pastedElement);
                                        cmd = new AddDeleteParameterCmd(
                                            true, pastedElement, pastedElement.id,
                                            this.parameterContainer.getId(), -1, this);
                                        cmdGroup.addCommand(cmd);
                                    } else if (pastedElement.baseClass === 'Style') {
                                        cmd = new AddDeleteStyleCmd(
                                            true, pastedElement, pastedElement.id,
                                            this.styleContainer.getId(), -1, this);
                                        cmdGroup.addCommand(cmd);
                                    }
                                }
                            }
                            if (!cmdGroup.isEmpty()) {
                                this.executeCommand(cmdGroup);
                                let clearSelection = true;
                                for (let pastedElement of pastedElements) {
                                    this.selectObject(pastedElement.id, clearSelection);
                                    clearSelection = false;
                                }
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
                                    obj.addCommandsForDelete(cmdGroup);
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
                            let field = (event.which === 37 || event.which === 39) ? 'x' : 'y';
                            let bandWidth = this.getDocumentProperties().getContentSize().width;
                            for (let selectionId of this.selections) {
                                let obj = this.getDataObject(selectionId);
                                if (obj instanceof DocElement) {
                                    if (obj.hasProperty(field)) {
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
                                            let containerSize = obj.getContainerContentSize();
                                            if ((obj.getValue('xVal') + obj.getValue('widthVal')) < containerSize.width) {
                                                val = obj.getValue('xVal') + 1;
                                            }
                                        } else if (event.which === 40) {
                                            let containerSize = obj.getContainerContentSize();
                                            if ((obj.getValue('yVal') + obj.getValue('heightVal')) < containerSize.height) {
                                                val = obj.getValue('yVal') + 1;
                                            }
                                        }
                                        if (val !== null) {
                                            let cmd = new SetValueCmd(
                                                selectionId, field, val, SetValueCmd.type.text, this);
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
        };
        document.addEventListener('keydown', this.keydownEventListener);

        this.render();
        this.setup();
    }

    /**
     * Validate properties used to initialize ReportBro.
     * In case of invalid properties additional info will be printed to the JS console.
     * @param {Object[]} properties - properties to validate
     * @returns {Boolean} true if all properties are valid, false otherwise.
     */
    validateProperties(properties) {
        if (!Array.isArray(properties.colors)) {
            console.error('"colors" property must be an array');
            return false;
        }
        let colorBlackExists = false;
        for (const color of properties.colors) {
            if (!color || !utils.isValidColor(color)) {
                console.error('"colors" property contains invalid color value');
                return false;
            }
            if (color === '#000000') {
                colorBlackExists = true;
            }
        }
        if (!colorBlackExists) {
            console.error('"colors" property is missing black color "#000000"');
            return false;
        }

        if (!Array.isArray(properties.fontSizes)) {
            console.error('"fontSizes" property must be an array');
            return false;
        }
        for (const fontSize of properties.fontSizes) {
            if (typeof fontSize !== 'number' || fontSize < 1) {
                console.error('"fontSizes" property must contain only numbers (> 0)');
                return false;
            }
        }
        return true;
    }

    /**
     * Add main panel items for sub categories like watermark texts and images.
     *
     * This must be called after the main panel was rendered because children of main panel items can
     * only be added after the parent is rendered.
     */
    addMainPanelItemSubCategories() {
        const watermarkTextsItem = new MainPanelItem(
            'watermarkText', this.mainPanel.getWatermarksItem(), this.watermarkTextContainer, {
                hasChildren: true, showAdd: true, showDelete: false, hasDetails: false, draggable: false }, this,
        );
        this.watermarkTextContainer.setPanelItem(watermarkTextsItem);
        this.mainPanel.getWatermarksItem().appendChild(watermarkTextsItem);
        this.watermarkTextContainer.setup();

        const watermarkImagesItem = new MainPanelItem(
            'watermarkImage', this.mainPanel.getWatermarksItem(), this.watermarkImageContainer, {
                hasChildren: true, showAdd: true, showDelete: false, hasDetails: false, draggable: false }, this,
        );
        this.watermarkImageContainer.setPanelItem(watermarkImagesItem);
        this.mainPanel.getWatermarksItem().appendChild(watermarkImagesItem);
        this.watermarkImageContainer.setup();
    }

    /**
     * Adds default parameters like page count/number.
     */
    addDefaultParameters() {
        for (let parameterData of [
            { name: 'page_count', type: Parameter.type.number, eval: false, editable: false, showOnlyNameType: true },
            { name: 'page_number', type: Parameter.type.number, eval: false, editable: false, showOnlyNameType: true }
            ]) {
            let parameter = new Parameter(this.getUniqueId(), parameterData, this);
            let parentPanel = this.mainPanel.getParametersItem();
            let panelItem = new MainPanelItem(
                'parameter', parentPanel, parameter, {
                    hasChildren: false, showAdd: false, showDelete: false, draggable: false }, this
            );
            parameter.setPanelItem(panelItem);
            parentPanel.appendChild(panelItem);
            parameter.setup();
            this.addParameter(parameter);
        }
    }

    render() {
        utils.emptyElement(this.element);
        if (this.getProperty('menuSidebar')) {
            this.element.classList.add('rbroMenuPanelSidebar');
        }
        if (this.getProperty('theme') === 'classic') {
            document.body.classList.add('rbroClassicTheme');
        } else {
            document.body.classList.add('rbroDefaultTheme');
        }
        this.element.append(utils.createElement('div', { class: 'rbroLogo' }));
        this.element.append(utils.createElement('div', { id: 'rbro_menu_panel', class: 'rbroMenuPanel' }));
        const elContainer = utils.createElement('div', { class: 'rbroContainer' });
        const elMainPanel = utils.createElement('div', { id: 'rbro_main_panel', class: 'rbroMainPanel' });
        elMainPanel.append(utils.createElement('ul', { id: 'rbro_main_panel_list' }));
        elContainer.append(elMainPanel);
        elContainer.append(utils.createElement('div', { id: 'rbro_main_panel_sizer', class: 'rbroMainPanelSizer' }));
        elContainer.append(utils.createElement('div', { id: 'rbro_detail_panel', class: 'rbroDetailPanel' }));
        elContainer.append(utils.createElement('div', { id: 'rbro_document_panel', class: 'rbroDocumentPanel' }));
        this.element.append(elContainer);
        this.mainPanel.render();
        this.menuPanel.render();
        for (let panelName in this.detailPanels) {
            this.detailPanels[panelName].render();
        }
        this.detailPanels[this.activeDetailPanel].show();
        this.document.render();
        this.popupWindow.render();
        this.updateMenuButtons();

        this.mouseupEventListener = (event) => {
            this.mainPanel.mouseUp(event);
            this.document.mouseUp(event);
            this.popupWindow.hide();
        };
        document.addEventListener('mouseup', this.mouseupEventListener);

        window.addEventListener('resize', (event) => {
            this.document.windowResized();
        });

        this.element.addEventListener('dragstart', (event) => {
            // disable dragging per default, otherwise e.g. a text selection can be dragged in Chrome
            event.preventDefault();
        });
        this.element.addEventListener('mousemove', (event) => {
           if (!this.mainPanel.processMouseMove(event)) {
               this.document.processMouseMove(event);
           }
       });
    }

    /**
     * Returns total width of element containing ReportBro Designer.
     * @returns {Number}
     */
    getWidth() {
        return this.element.clientWidth;
    }

    setup() {
        this.addMainPanelItemSubCategories();
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
        this.addDataObject(this.watermarkTextContainer);
        this.addDataObject(this.watermarkImageContainer);
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

    /**
     * Get ReportBro property.
     * @param {String} key - property name
     * @returns {*}
     */
    getProperty(key) {
        return this.properties[key];
    }

    getMainPanel() {
        return this.mainPanel;
    }

    getMenuPanel() {
        return this.menuPanel;
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
     * @returns {Object[]} Each item contains name (String), optional description (String) and
     * optional separator (Boolean).
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
     * @param {DocElement|Parameter} obj - adds all parameters available for
     * this object (which is either a doc element or a parameter).
     * For doc elements the parameters from the data source
     * are included (e.g. array field parameters of a table data source).
     * @param {?String[]} allowedTypes - specify allowed parameter types which will be added to the
     * parameters list. If not set all parameter types are allowed.
     * @returns {Object[]} Each item contains name (String), optional description (String) and
     * optional separator (Boolean).
     */
    getParameterItems(obj, allowedTypes) {
        const parameters = [];
        const parameterItems = this.getMainPanel().getParametersItem().getChildren();
        // dataSourceIndex is only needed for separator id which is used to hide the separator
        // when there are no data source parameters available (due to search filter)
        let dataSourceIndex = 0;
        if (obj instanceof DocElement) {
            const dataSources = obj.getAllDataSources();
            let firstDataSource = true;
            for (const dataSource of dataSources) {
                if (dataSource.parameters.length > 0) {
                    let groupName;
                    if (firstDataSource)  {
                        groupName = this.getLabel('parametersDataSource');
                    } else {
                        // include data source name in group label to better distinguish groups
                        // of additional data sources
                        groupName = this.getLabel('parametersDataSourceName').replace('${name}', dataSource.name);
                    }
                    parameters.push({
                        separator: true,
                        separatorClass: 'rbroParameterDataSourceGroup',
                        id: 'ds' + dataSourceIndex,
                        name: groupName
                    });
                    // add all parameters of collections at end of data source parameters
                    // with a header containing the collection name
                    const mapParameters = [];
                    // do not append data source name for first data source as this is the default data source
                    const dataSourceName = firstDataSource ? null : dataSource.name;
                    for (const dataSourceParameter of dataSource.parameters) {
                        if (dataSourceParameter.type === Parameter.type.map) {
                            dataSourceParameter.appendParameterItems(mapParameters, allowedTypes, dataSourceName);
                        } else {
                            dataSourceParameter.appendParameterItems(parameters, allowedTypes, dataSourceName);
                        }
                    }
                    for (const mapParameter of mapParameters) {
                        parameters.push(mapParameter);
                    }
                }
                firstDataSource = false;
                dataSourceIndex++;
            }
        } else if (obj instanceof Parameter) {
            let parent = obj.getParent();
            while (parent !== null) {
                if (parent.type === Parameter.type.array) {
                    // parameter is inside a list -> set dataSourceIndex so data source prefix is
                    // set for root parameters
                    dataSourceIndex = 1;
                    parent.appendFieldParameterItems(parameters, allowedTypes, true, null);
                    break;
                }
                parent = parent.getParent();
            }
        }

        // if there is at least one data source the parameter list is returned for an element with a data source.
        // therefor we set the data source for root parameters to empty string instead of null. this way
        // the root parameters are displayed with a colon prefix (e.g. ":address" instead of "address")
        // in the parameter popup window which makes it possible to explicitly reference a root parameter.
        const rootDataSourceName = dataSourceIndex > 0 ? '' : null;
        parameters.push({ separator: true, name: this.getLabel('parameters') });
        // add all parameters of collections at end of list with a header containing the collection name
        const mapParameters = [];
        for (const parameterItem of parameterItems) {
            const parameter = parameterItem.getData();
            if (parameter.getValue('type') === Parameter.type.map) {
                parameter.appendParameterItems(mapParameters, allowedTypes, rootDataSourceName);
            } else {
                parameter.appendParameterItems(parameters, allowedTypes, rootDataSourceName);
            }
        }
        return parameters.concat(mapParameters);
    }

    /**
     * Returns a list of all array field parameter items.
     * Used for parameter popup window.
     * @param {String[]} allowedTypes - specify allowed parameter types which will
     * be added to the parameters list. If not set all parameter types are allowed.
     * @returns {Object[]} Each item contains name (String), optional description (String) and
     * optional separator (Boolean).
     */
    getArrayFieldParameterItems(allowedTypes) {
        let parameters = [];
        let parameterItems = this.getMainPanel().getParametersItem().getChildren();
        parameters.push({ separator: true, name: this.getLabel('parameters') });
        for (let parameterItem of parameterItems) {
            let parameter = parameterItem.getData();
            if (parameter.getValue('type') === Parameter.type.array) {
                parameter.appendFieldParameterItems(parameters, allowedTypes, false, null);
            }
        }
        return parameters;
    }

    /**
     * Append document elements of given container.
     * @param {Container} container
     * @param {Boolean} asObjects - if true the document element instances are returned, otherwise
     * each instance is transformed to a js map.
     * @param {DocElement[]} docElements - list where document elements will be appended to.
     */
    appendContainerDocElements(container, asObjects, docElements) {
        let children = container.getPanelItem().getChildren();
        for (let child of children) {
            if (child.getData() instanceof DocElement) {
                let docElement = child.getData();
                if (asObjects) {
                    docElements.push(docElement);
                    // we are also adding all internal children (document elements which belong
                    // to other document elements and cannot be created independently),
                    // e.g. a table band or a table cell (table text) of a table element.
                    docElement.addChildren(docElements);
                } else {
                    // js map also includes data of internal children
                    docElements.push(docElement.toJS());
                }
                let containers = [];
                if (docElement instanceof SectionElement) {
                    containers = docElement.getLinkedContainers();
                } else {
                    let linkedContainer = docElement.getLinkedContainer();
                    if (linkedContainer !== null) {
                        containers.push(linkedContainer);
                    }
                }
                // add children of doc elements which represent containers, e.g. frames or section bands
                for (let container of containers) {
                    this.appendContainerDocElements(container, asObjects, docElements);
                }
            }
        }
    };

    /**
     * Get document elements of all bands.
     * @param {Boolean} asObjects - if true the document element instances are returned, otherwise
     * each instance is transformed to a js map.
     * @returns {DocElement[]} List of document elements.
     */
    getDocElements(asObjects) {
        let docElements = [];
        this.appendContainerDocElements(this.headerBand, asObjects, docElements);
        this.appendContainerDocElements(this.contentBand, asObjects, docElements);
        this.appendContainerDocElements(this.footerBand, asObjects, docElements);
        return docElements;
    }

    setDetailPanel(panelName) {
        if (panelName !== this.activeDetailPanel) {
            this.detailPanels[this.activeDetailPanel].hide();
            this.activeDetailPanel = panelName;
            this.detailPanels[panelName].show();
        }
    }

    /**
     * Is called when a data object was modified (including new and deleted data objects).
     * @param {*} obj - new/deleted/modified data object.
     * @param {String} operation - operation which caused the notification.
     * @param {String} [field] - affected field in case of change operation.
     */
    notifyEvent(obj, operation, field) {
        this.detailPanels[this.activeDetailPanel].notifyEvent(obj, operation, field);
    }

    addParameter(parameter) {
        this.addDataObject(parameter);
    }

    addStyle(style) {
        this.addDataObject(style);
        this.notifyEvent(style, Command.operation.add);
    }

    getStyles() {
        let styles = [];
        for (const styleItem of this.getMainPanel().getStylesItem().getChildren()) {
            styles.push(styleItem.getData());
        }
        return styles;
    }

    getParameters() {
        const parameters = [];
        for (const parameterItem of this.getMainPanel().getParametersItem().getChildren()) {
            parameters.push(parameterItem.getData());
        }
        return parameters;
    }

    getWatermarks() {
        const watermarks = [];
        for (const watermarkTextItem of this.watermarkTextContainer.getPanelItem().getChildren()) {
            watermarks.push(watermarkTextItem.getData());
        }
        for (const watermarkImageItem of this.watermarkImageContainer.getPanelItem().getChildren()) {
            watermarks.push(watermarkImageItem.getData());
        }
        return watermarks;
    }

    addDocElement(element) {
        this.docElements.push(element);
        this.addDataObject(element);
    }

    deleteDocElements() {
        for (let i=0; i < this.docElements.length; i++) {
            this.deleteDataObject(this.docElements[i]);
        }
        this.docElements = [];
    }

    getDocumentProperties() {
        return this.documentProperties;
    }

    executeCommand(cmd) {
        cmd.do();
        if (this.lastCommandIndex < (this.commandStack.length - 1)) {
            this.commandStack = this.commandStack.slice(0, this.lastCommandIndex + 1);
        }
        if (!this.selectionSinceLastCommand && this.commandStack.length > 0) {
            // if previous command can be replaced by current command
            // we can discard the previous command and only keep the latest update
            let prevCmd = this.commandStack[this.commandStack.length - 1];
            if (cmd.allowReplace(prevCmd)) {
                cmd.replace(prevCmd);
                this.commandStack = this.commandStack.slice(0, this.commandStack.length - 1);
                this.lastCommandIndex--;
            }
        }
        this.commandStack.push(cmd);
        this.lastCommandIndex++;
        this.modified = true;
        this.selectionSinceLastCommand = false;
        this.updateMenuButtons();
        if (this.properties.cmdExecutedCallback) {
            this.properties.cmdExecutedCallback(cmd, true);
        }
    }

    undoCommand() {
        if (this.lastCommandIndex >= 0) {
            let cmd = this.commandStack[this.lastCommandIndex];
            cmd.undo();
            this.lastCommandIndex--;
            this.modified = (this.lastCommandIndex !== this.savedCommandIndex);
            this.updateMenuButtons();
            if (this.properties.cmdExecutedCallback) {
                this.properties.cmdExecutedCallback(cmd, false);
            }
        }
    }

    redoCommand() {
        if (this.lastCommandIndex < (this.commandStack.length - 1)) {
            this.lastCommandIndex++;
            let cmd = this.commandStack[this.lastCommandIndex];
            cmd.do();
            this.modified = (this.lastCommandIndex !== this.savedCommandIndex);
            this.updateMenuButtons();
            if (this.properties.cmdExecutedCallback) {
                this.properties.cmdExecutedCallback(cmd, false);
            }
        }
    }

    updateMenuButtons() {
        document.getElementById('rbro_menu_save').disabled = !this.modified;
        document.getElementById('rbro_menu_undo').disabled = (this.lastCommandIndex < 0);
        document.getElementById('rbro_menu_redo').disabled = (this.lastCommandIndex >= (this.commandStack.length - 1));
    }

    updateMenuActionButtons() {
        let elementCount = 0;
        let previousContainerOffset = { x: 0, y: 0 };
        let elementSameContainerOffsetX = true;
        let elementSameContainerOffsetY = true;
        for (let selectionId of this.selections) {
            let obj = this.getDataObject(selectionId);
            if (obj instanceof DocElement && obj.hasProperty('x')) {
                elementCount++;
                let container = obj.getContainer();
                let offset = container.getOffset();
                if (elementCount === 1) {
                    previousContainerOffset = offset;
                } else {
                    if (offset.x !== previousContainerOffset.x) {
                        elementSameContainerOffsetX = false;
                    }
                    if (offset.y !== previousContainerOffset.y) {
                        elementSameContainerOffsetY = false;
                    }
                }
            }
        }

        const menuButtons = document.getElementById('rbo_menu_elements').querySelectorAll('.rbroMenuButton');
        if (elementCount > 1) {
            // allow alignment of elements if their parent container has the same x/y offset
            if (elementSameContainerOffsetX) {
                document.getElementById('rbro_menu_align').removeAttribute('style');
            } else {
                document.getElementById('rbro_menu_align').style.display = 'none';
            }
            if (elementSameContainerOffsetY) {
                document.getElementById('rbro_menu_valign').removeAttribute('style');
            } else {
                document.getElementById('rbro_menu_valign').style.display = 'none';
            }
            for (const menuButton of menuButtons) {
                menuButton.style.display = 'none';
            }
            document.getElementById('rbro_menu_column_actions').style.display = 'none';
            document.getElementById('rbro_menu_row_actions').style.display = 'none';
        } else {
            let obj = null;
            if (this.selections.length === 1) {
                obj = this.getDataObject(this.selections[0]);
            }
            document.getElementById('rbro_menu_align').style.display = 'none';
            document.getElementById('rbro_menu_valign').style.display = 'none';
            if (obj instanceof TableTextElement) {
                for (const menuButton of menuButtons) {
                    menuButton.style.display = 'none';
                }
                const table = obj.getTable();
                const parent = obj.getParent();
                if (table !== null && utils.convertInputToNumber(table.getValue('columns')) !== 1) {
                    document.getElementById('rbro_menu_column_delete').removeAttribute('style');
                } else {
                    document.getElementById('rbro_menu_column_delete').style.display = 'none';
                }
                document.getElementById('rbro_menu_column_actions').removeAttribute('style');
                if (table !== null && parent !== null && parent.getValue('bandType') === Band.bandType.content) {
                    if (utils.convertInputToNumber(table.getValue('contentRows')) !== 1) {
                        document.getElementById('rbro_menu_row_delete').removeAttribute('style');
                    } else {
                        document.getElementById('rbro_menu_row_delete').style.display = 'none';
                    }
                    document.getElementById('rbro_menu_row_actions').removeAttribute('style');
                } else {
                    document.getElementById('rbro_menu_row_actions').style.display = 'none';
                }
            } else {
                for (const menuButton of menuButtons) {
                    menuButton.removeAttribute('style');
                }
                document.getElementById('rbro_menu_column_actions').style.display = 'none';
                document.getElementById('rbro_menu_row_actions').style.display = 'none';
            }
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

    getSelectedObjects() {
        let rv = [];
        for (let selectionId of this.selections) {
            let obj = this.getDataObject(selectionId);
            if (obj !== null) {
                rv.push(obj);
            }
        }
        return rv;
    }

    getSelectedObject() {
        if (this.selections.length === 1) {
            return this.getDataObject(this.selections[0]);
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
        let detailPanel = 'none';
        let obj = this.getDataObject(id);
        if (clearSelection) {
            if (obj !== null && this.selections.length === 1 && this.selections[0] === id) {
                // nothing to do, selection did not change
                return;
            }
            this.deselectAll(true);
        }
        if (obj !== null) {
            if (obj instanceof DocElement) {
                detailPanel = 'docElement';
            } else if (obj instanceof Parameter) {
                detailPanel = 'parameter';
            } else if (obj instanceof Style) {
                detailPanel = 'style';
            } else if (obj instanceof DocumentProperties) {
                detailPanel = 'documentProperties';
            }

            this.selections.push(id);
            obj.select();
            if (obj.getPanelItem() !== null) {
                obj.getPanelItem().openParentItems();
                obj.getPanelItem().setActive();
            }
            if (detailPanel !== this.activeDetailPanel) {
                this.setDetailPanel(detailPanel);
            }
            this.detailPanels[this.activeDetailPanel].selectionChanged();

            if (this.properties.selectCallback) {
                this.properties.selectCallback(obj, true);
            }
        }

        this.selectionSinceLastCommand = true;
        this.updateMenuActionButtons();
    }

    deselectObject(id) {
        this.deselectObjectInternal(id, true);
        this.updateMenuActionButtons();
    }

    deselectObjectInternal(id, updateSelections) {
        let obj = this.getDataObject(id);
        if (obj !== null) {
            obj.deselect();
            if (obj.getPanelItem() !== null) {
                obj.getPanelItem().setInactive();
            }
        }

        if (updateSelections) {
            let selectionIndex = this.selections.indexOf(id);
            if (selectionIndex !== -1) {
                this.selections.splice(selectionIndex, 1);
            }
            if (this.selections.length > 0) {
                this.detailPanels[this.activeDetailPanel].selectionChanged();
            } else {
                this.setDetailPanel('none');
            }
        }

        if (obj !== null && this.properties.selectCallback) {
            this.properties.selectCallback(obj, false);
        }
    }

    deselectAll(notifyPanel) {
        for (let selectionId of this.selections) {
            this.deselectObjectInternal(selectionId, false);
        }
        this.selections = [];
        if (notifyPanel) {
            this.setDetailPanel('none');
        }
        this.updateMenuActionButtons();
    }

    getContainer(posX, posY, elementType, ignoreContainers) {
        let bestMatch = null;
        let bestMatchLevel = -1;
        // watermark text and image elements always stay in their container for page background
        if (elementType === DocElement.type.watermarkText) {
            return this.watermarkTextContainer;
        } else if (elementType === DocElement.type.watermarkImage) {
            return this.watermarkImageContainer;
        }
        for (let i = 0; i < this.containers.length; i++) {
            const container = this.containers[i];
            if (container.getLevel() > bestMatchLevel && container.isElementAllowed(elementType) &&
                    container.isInside(posX, posY)) {
                let isIgnoredContainer = false;
                for (const ignoreContainer of ignoreContainers) {
                    if (container === ignoreContainer || container.isChildOf(ignoreContainer)) {
                        isIgnoredContainer = true;
                        break;
                    }
                }
                if (!isIgnoredContainer) {
                    bestMatch = container;
                    bestMatchLevel = container.getLevel();
                }
            }
        }
        return bestMatch;
    }

    getContainers() {
        return this.containers;
    }

    addContainer(container) {
        this.containers.push(container);
        this.addDataObject(container);
    }

    deleteContainer(container) {
        for (let i = 0; i < this.containers.length; i++) {
            if (this.containers[i].getId() === container.getId()) {
                this.containers.splice(i, 1);
                break;
            }
        }
        this.deleteDataObject(container);
    }

    /**
     * Store our own drag data because dataTransfer data of event is not available in
     * dragenter/dragover/dragleave events (in some browsers).
     */
    startBrowserDrag(browserDragType, browserDragElementType, browserDragId) {
        this.browserDragType = browserDragType;
        this.browserDragId = browserDragId;
        this.getDocument().startBrowserDrag(browserDragElementType);
    }

    isBrowserDragActive(browserDragType) {
        return this.browserDragType === browserDragType;
    }

    getBrowserDragId() {
        return this.browserDragId;
    }

    updateSelectionDrag(diffX, diffY, dragType, dragContainer, store) {
        let cmdGroup;
        if (store) {
            cmdGroup = new CommandGroupCmd(
                (dragType === DocElement.dragType.element) ? 'Update position' : 'Resize', this);
        }
        for (let selectionId of this.selections) {
            let obj = this.getDataObject(selectionId);
            if (obj !== null) {
                if (dragType !== DocElement.dragType.element || obj.isDraggingAllowed()) {
                    obj.updateDrag(diffX, diffY, dragType, dragContainer, store ? cmdGroup : null);
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
        let x, y, width, height;
        let minX = Number.MAX_VALUE, maxX = Number.MIN_VALUE, minY = Number.MAX_VALUE, maxY = Number.MIN_VALUE;
        let elementCount = 0;
        for (let selectionId of this.selections) {
            let obj = this.getDataObject(selectionId);
            if (obj instanceof DocElement && obj.hasProperty('x')) {
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
                            let cmd = new SetValueCmd(
                                obj.getId(), 'x', '' + minX, SetValueCmd.type.text, this);
                            cmdGroup.addCommand(cmd);
                        }
                        break;
                        case Style.alignment.center: {
                            let cmd = new SetValueCmd(
                                obj.getId(), 'x', '' + (center - (obj.getValue('widthVal') / 2)),
                                SetValueCmd.type.text, this);
                            cmdGroup.addCommand(cmd);
                        }
                        break;
                        case Style.alignment.right: {
                            let cmd = new SetValueCmd(
                                obj.getId(), 'x', '' + (maxX - obj.getValue('widthVal')),
                                SetValueCmd.type.text, this);
                            cmdGroup.addCommand(cmd);
                        }
                        break;
                        case Style.alignment.top: {
                            let cmd = new SetValueCmd(
                                obj.getId(), 'y', '' + minY, SetValueCmd.type.text, this);
                            cmdGroup.addCommand(cmd);
                        }
                        break;
                        case Style.alignment.middle: {
                            let cmd = new SetValueCmd(
                                obj.getId(), 'y', '' + (vcenter - (obj.getValue('heightVal') / 2)),
                                SetValueCmd.type.text, this);
                            cmdGroup.addCommand(cmd);
                        }
                        break;
                        case Style.alignment.bottom: {
                            let cmd = new SetValueCmd(
                                obj.getId(), 'y', '' + (maxY - obj.getValue('heightVal')),
                                SetValueCmd.type.text, this);
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
        if (typeof(val) === 'string') {
            val = parseFloat(val.replace(',', '.'));
            if (isNaN(val)) {
                return '0px';
            }
        }
        return val + 'px';
    }

    /**
     * Shows a global loading image which disables all controls.
     */
    showLoading() {
        if (!document.getElementById('rbro_loading_div')) {
            document.body.append(
                utils.createElement('div', { id: 'rbro_loading_div', class: 'rbroLoadingIndicator' }));
        }
    }

    /**
     * Hides global loading image.
     */
    hideLoading() {
        const elLoadingDiv = document.getElementById('rbro_loading_div');
        if (elLoadingDiv) {
            elLoadingDiv.remove();
        }
    }

    getTestData() {
        let rv = {};
        for (let parameter of this.getParameters()) {
            if (!parameter.getValue('showOnlyNameType')) {
                let type = parameter.getValue('type');
                if (type === Parameter.type.array || type === Parameter.type.simpleArray ||
                        type === Parameter.type.map) {
                    rv[parameter.getName()] = parameter.getTestData(false);
                } else if (type === Parameter.type.string || type === Parameter.type.number ||
                        type === Parameter.type.date) {
                    rv[parameter.getName()] = parameter.getValue('testData');
                } else if (type === Parameter.type.boolean) {
                    rv[parameter.getName()] = parameter.getValue('testDataBoolean');
                } else if (type === Parameter.type.image) {
                    rv[parameter.getName()] = parameter.getValue('testDataImage');
                } else if (type === Parameter.type.richText) {
                    rv[parameter.getName()] = parameter.getValue('testDataRichText');
                }
            }
        }
        return rv;
    }

    /**
     * Performs ajax request to upload the report and either update displayed errors or
     * display report pdf in case report is valid.
     * @param {Object} data - report data.
     * @param {Boolean} isTestData - true if data contains test data from parameters.
     */
    previewInternal(data, isTestData) {
        const self = this;
        const requestParams = this.getRequestParameters();

        // clear all previous errors
        this.clearErrors();

        // use headers from properties and set basic auth header if basic auth info is available
        let headers = requestParams.reportServerHeaders;
        headers['Content-Type'] = 'application/json';
        if (requestParams.reportServerBasicAuth) {
            headers['Authorization'] = 'Basic ' + btoa(
                requestParams.reportServerBasicAuth.username + ':' + requestParams.reportServerBasicAuth.password);
        }

        this.showLoading();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), requestParams.reportServerTimeout);
        fetch(requestParams.reportServerUrl, {
            signal: controller.signal,
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({
                report: this.getReport(),
                outputFormat: DocumentProperties.outputFormat.pdf,
                data: data,
                isTestData: isTestData
            }),
        }).then((response) => {
            if (!response.ok) {
              throw Error(response.statusText);
            }
            if (self.properties.autoSaveOnPreview) {
                self.save();
            }
            return response;
        }).then((response) => response.text())
        .then((data) => {
            clearTimeout(timeoutId);
            self.hideLoading();
            if (data.substring(0, 4) === 'key:') {
                self.reportKey = data.substring(4);
                const url = new URL(requestParams.reportServerUrl, document.location);
                url.searchParams.set('key', self.reportKey);
                url.searchParams.set('outputFormat', 'pdf');
                self.getDocument().openPdfPreviewTab(url.toString(), headers);
            } else {
                self.reportKey = null;
                try {
                    let obj = JSON.parse(data);
                    if (obj.errors.length > 0) {
                        self.processErrors(obj.errors, false);
                    }
                } catch (e) {
                    alert('preview failed');
                }
            }
        }).catch((error) => {
            clearTimeout(timeoutId);
            self.hideLoading();
            alert('preview failed');
        });
    }

    getRequestParameters() {
        const params = {
            reportServerUrl: this.properties.reportServerUrl,
            reportServerTimeout: this.properties.reportServerTimeout,
            reportServerUrlCrossDomain: this.properties.reportServerUrlCrossDomain,
            reportServerBasicAuth: this.properties.reportServerBasicAuth,
            reportServerHeaders: this.properties.reportServerHeaders
        };
        // callback function which can be used to change request parameters
        if (this.properties.requestCallback) {
            this.properties.requestCallback(params);
        }
        return params;
    }

    ///////////////////////////////////////////////////////////////////////////
    // API functions
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Sets the internal modified flag.
     *
     * If true the save button is enabled, otherwise the save button is disabled.
     * @param {Boolean} modified
     */
    setModified(modified) {
        this.modified = modified;
        if (!modified) {
            this.savedCommandIndex = this.lastCommandIndex;
        }
        this.updateMenuButtons();
    }

    /**
     * Returns the internal modified flag.
     *
     * If the flag is true the save button is enabled, otherwise the save button is disabled and
     * there was no change to the report since the flag was last set to false (this happens
     * after save or by calling the setModified API method).
     * @returns {Boolean}
     */
    isModified() {
        return this.modified;
    }

    /**
     * Returns report object containing everything needed for the report.
     * @returns {Object}
     */
    getReport() {
        const rv = { docElements: [], parameters: [], styles: [], watermarks: [], version: 5 };
        rv.docElements = this.getDocElements(false);
        for (const parameter of this.getParameters()) {
            rv.parameters.push(parameter.toJS());
        }
        for (const style of this.getStyles()) {
            rv.styles.push(style.toJS());
        }
        for (const watermark of this.getWatermarks()) {
            rv.watermarks.push(watermark.toJS());
        }
        rv.documentProperties = this.documentProperties.toJS();

        return rv;
    }

    /**
     * Either calls saveCallback (if available) or stores report in local storage (if key is available).
     */
    save() {
        if (this.properties.saveCallback) {
            this.properties.saveCallback();
        } else if (this.properties.localStorageReportKey) {
            if ('localStorage' in window && window['localStorage'] !== null) {
                try {
                    let report = this.getReport();
                    // console.log(JSON.stringify(report));
                    window.localStorage.setItem(this.properties.localStorageReportKey, JSON.stringify(report));
                    this.setModified(false);
                } catch (e) {
                }
            }
        }

        if (this.getProperty('highlightUnusedParameters')) {
            // if unused parameters are highlighted the marker is removed on save
            for (let parameter of this.getParameters()) {
                if (parameter.editable) {
                    parameter.setHighlightUnused(false);
                }
            }
        }
    }

    /**
     * Loads report object into ReportBro Designer.
     * @param {Object} report - the report object.
     */
    load(report) {
        for (const parameter of this.getParameters()) {
            this.deleteDataObject(parameter);
        }
        for (const style of this.getStyles()) {
            this.deleteDataObject(style);
        }
        this.deleteDocElements();

        this.nextId = 1;
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
        this.getMainPanel().getWatermarksItem().close();

        if (report.version < 2) {
            for (const docElementData of report.docElements) {
                if (docElementData.elementType === DocElement.type.table) {
                    docElementData.contentDataRows = [docElementData.contentData];
                    docElementData.contentRows = '1';
                }
            }
        }
        if (report.version < 3) {
            for (const docElementData of report.docElements) {
                if (docElementData.elementType === DocElement.type.table) {
                    let width = 0;
                    for (let i=0; i < docElementData.headerData.columnData.length; i++) {
                        width += docElementData.headerData.columnData[i].width;
                    }
                    docElementData.width = width;
                }
            }
        }
        if (report.version < 4) {
            for (let parameterData of report.parameters) {
                if (parameterData.type === Parameter.type.map) {
                    const testData = {};
                    for (const child of parameterData.children) {
                        testData[child.name] = child.testData;
                        child.testData = '';
                    }
                    parameterData.testData = JSON.stringify(testData);
                } else if (parameterData.type === Parameter.type.boolean) {
                    parameterData.testDataBoolean = Boolean(parameterData.testData);
                }
            }
        }
        if (report.version < 5) {
            report.watermarks = [];
        }

        this.documentProperties.setInitialData(report.documentProperties);
        this.documentProperties.setup();

        for (const styleData of report.styles) {
            this.createStyle(styleData);
        }
        for (const parameterData of report.parameters) {
            this.createParameter(parameterData, null);
        }
        for (const docElementData of report.docElements) {
            this.createDocElement(docElementData);
        }
        for (const watermarkData of report.watermarks) {
            this.createDocElement(watermarkData);
        }

        if (this.getProperty('highlightUnusedParameters')) {
            // highlight unused parameters when report is loaded

            // to determine if a parameter is used we query the commands
            // which would be necessary in case the parameter name is changed.
            // if no commands are returned then the parameter is not used
            let docElements = this.getDocElements(true);
            for (let parameter of this.getParameters()) {
                if (parameter.editable) {
                    let cmdGroup = new CommandGroupCmd('Temp group');
                    for (let docElement of docElements) {
                        docElement.addCommandsForChangedParameterName(
                            parameter, parameter.getName(), cmdGroup);
                    }
                    for (let otherParam of this.getParameters()) {
                        if (otherParam.getId() !== parameter.getId()) {
                            otherParam.addCommandsForChangedParameterName(
                                parameter, parameter.getName(), cmdGroup);
                        }
                    }
                    if (cmdGroup.isEmpty()) {
                        parameter.setHighlightUnused(true);
                    }
                }
            }
        }

        this.browserDragType = '';
        this.browserDragId = '';

        this.commandStack = [];
        this.lastCommandIndex = -1;
        this.savedCommandIndex = -1;
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
        const requestParams = this.getRequestParameters();
        const url = new URL(requestParams.reportServerUrl, document.location);
        url.searchParams.set('key', this.reportKey);
        url.searchParams.set('outputFormat', 'xlsx');
        const headers = requestParams.reportServerHeaders;
        const self = this;
        if (this.reportKey !== null) {
            if (headers && Object.keys(headers).length > 0) {
                // use ajax request so we can set custom headers
                const xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            if (xhr.response.type === 'application/json') {
                                const reader = new FileReader();
                                reader.addEventListener("loadend", function() {
                                    const data = reader.result;
                                    try {
                                        const obj = JSON.parse(data);
                                        if (obj.errors.length > 0) {
                                            self.processErrors(obj.errors, false);
                                        }
                                    } catch (e) {
                                        alert('download failed');
                                    }
                                });
                                reader.readAsText(xhr.response);
                            } else {
                                const url = URL.createObjectURL(xhr.response);
                                // popup blocker will block window because of async download
                                window.open(url, '_blank');
                            }
                        } else {
                            alert('download failed');
                        }
                    }
                };

                xhr.open('GET', url.toString(), true);
                for (const headerName in headers) {
                    if (headers.hasOwnProperty(headerName)) {
                        xhr.setRequestHeader(headerName, headers[headerName]);
                    }
                }
                xhr.send();
            } else {
                // easy way (no custom headers), open a new window with the file url
                window.open(url.toString(), '_blank');
            }
        }
    }

    /**
     * Displays the given errors.
     *
     * The errors are returned from reportbro-lib during report creation.
     * @param {Object[]} errors - list of errors where each item is a map which contains
     * object_id (Number), field (String), msg_key (String) and optional info (String).
     * @param {Boolean} [clear] - if true or undefined then already existing errors will be cleared.
     */
    processErrors(errors, clear) {
        if ((clear === undefined) || clear) {
            this.clearErrors();
        }

        for (let error of errors) {
            if (error.object_id) {
                document.getElementById(`rbro_menu_item${error.object_id}`).classList.add('rbroError');
                let obj = this.getDataObject(error.object_id);
                if (obj !== null) {
                    obj.addError(error);
                }
            }
        }
        if (errors.length > 0) {
            this.deselectAll(false);
            this.selectObject(errors[0].object_id, false);
            this.detailPanels[this.activeDetailPanel].scrollToFirstError();
        }
    }

    /**
     * Clears all error classes (which highlight elements with errors) and all error messages.
     */
    clearErrors() {
        const menuItems = document.querySelectorAll('.rbroMenuItem');
        for (const menuItem of menuItems) {
            menuItem.classList.remove('rbroError');
        }
        const formRows = document.querySelectorAll('.rbroFormRow');
        for (const formRow of formRows) {
            formRow.classList.remove('rbroError');
        }
        const errorMessages = document.querySelectorAll('.rbroErrorMessage');
        for (const errorMessage of errorMessages) {
            errorMessage.textContent = '';
        }
        for (let objId in this.objectMap) {
            this.objectMap[objId].clearErrors();
        }
    }

    /**
     * Delete ReportBro Instance including all dom nodes and all registered event handlers.
     */
    destroy() {
        this.popupWindow.destroy();
        for (let panelName in this.detailPanels) {
            this.detailPanels[panelName].destroy();
        }
        this.element.remove();
        document.removeEventListener('keydown', this.keydownEventListener);
        document.removeEventListener('mouseup', this.mouseupEventListener);
    }

    /**
     * Returns a new unique id which can be used for any data object.
     * @returns {Number}
     */
    getUniqueId() {
        return this.nextId++;
    }

    /**
     * Returns document element for the given id, or null if document element does not exist.
     * @param {Number} id - Id of document element to search for.
     * @returns {?DocElement}
     */
    getDocElementById(id) {
        let obj = this.getDataObject(id);
        if (obj instanceof DocElement) {
            return obj;
        }
        return null;
    }

    /**
     * Returns parameter for the given id, or null if parameter does not exist.
     * @param {Number} id - Id of parameter to search for.
     * @returns {?Parameter}
     */
    getParameterById(id) {
        let obj = this.getDataObject(id);
        if (obj instanceof Parameter) {
            return obj;
        }
        return null;
    }

    /**
     * Returns parameter for the given name, or null if parameter does not exist.
     * @param {String} parameterName - Name of parameter to search for, parameter could also
     * be a parameter inside a map (e.g. "Address.Contacts") or an array field.
     * @returns {?Parameter}
     */
    getParameterByName(parameterName) {
        return this.getParameterByNameInternal(parameterName, null);
    }

    /**
     * Returns parameter for the given name, or null if parameter does not exist.
     * @param {String} parameterName - Name of parameter to search for, parameter could also
     * be a parameter inside a map (e.g. "Address.Contacts") or an array field.
     * @param {?Parameter} parent - parameter which is used for recursive search of parameter inside map/array.
     * @returns {?Parameter}
     */
    getParameterByNameInternal(parameterName, parent) {
        let parameters;
        let parentName = null, fieldName = null;
        const pos = parameterName.indexOf('.');
        // if parameter name contains a dot the name references a parameter inside a map/array
        if (pos !== -1) {
            parentName = parameterName.substring(0, pos);
            fieldName = parameterName.substring(pos + 1);
        }

        if (parent) {
            // get map/array fields
            parameters = parent.getChildren();
        } else {
            // get all available parameters
            parameters = this.getParameters();
        }

        for (let parameter of parameters) {
            if (parentName !== null && (parameter.getValue('type') === Parameter.type.map ||
                    parameter.getValue('type') === Parameter.type.array) &&
                    parameter.getValue('name') === parentName) {
                // search recursively for parameter inside map/array
                return this.getParameterByNameInternal(fieldName, parameter);
            } else if (parentName === null && parameter.getValue('name') === parameterName) {
                return parameter;
            }
        }
        return null;
    }

    /**
     * Returns style for the given id, or null if style does not exist.
     * @param {Number} id - Id of style to search for.
     * @returns {?Style}
     */
    getStyleById(id) {
        let obj = this.getDataObject(id);
        if (obj instanceof Style) {
            return obj;
        }
        return null;
    }

    /**
     * Creates a doc element with given data.
     * @param {Object} docElementData - Map containing all data for new doc element, must
     * also contain a unique id.
     * @returns {DocElement} the created doc element.
     */
    createDocElement(docElementData) {
        let element = AddDeleteDocElementCmd.createElement(
            docElementData.id, docElementData, docElementData.elementType, -1, false, this);
        let maxId = element.getMaxId();
        if (maxId >= this.nextId) {
            this.nextId = maxId + 1;
        }
        return element;
    }

    /**
     * Creates a parameter with given data.
     * @param {Object} parameterData - Map containing all data for new parameter, must
     * also contain an unique id.
     * @param {?Parameter} parent - optional parent parameter (must be of type map or array) where
     * created parameter will be added to (i.e. created parameter is a field inside a map/array).
     * @returns {Parameter} the created parameter.
     */
    createParameter(parameterData, parent) {
        let parameter = new Parameter(parameterData.id, parameterData, this);
        let parentPanel = null;
        if (parent && (parent.getValue('type') === Parameter.type.array ||
                parent.getValue('type') === Parameter.type.map)) {
            // create parameter inside parent, i.e. parameter is a field inside a map or array
            parentPanel = parent.getPanelItem();
        } else {
            parentPanel = this.mainPanel.getParametersItem();
        }
        const adminMode = this.getProperty('adminMode');
        const showOnlyNameType = parameter.getValue('showOnlyNameType');
        const showAddDelete = adminMode && !showOnlyNameType;
        // in case children and add/delete buttons exist: the visibility depends on parameter
        // type which can be modified (e.g. map and list have children and add button) and
        // is updated dynamically
        let panelItem = new MainPanelItem(
            'parameter', parentPanel, parameter,
            { hasChildren: !showOnlyNameType, showAdd: showAddDelete, showDelete: showAddDelete, draggable: true },
            this);
        parameter.setPanelItem(panelItem);
        parentPanel.appendChild(panelItem);
        parameter.setup();
        if (adminMode && !showOnlyNameType && parameter.getValue('type') !== Parameter.type.array &&
                parameter.getValue('type') !== Parameter.type.map) {
            document.getElementById(`rbro_menu_item_add${parameter.getId()}`).style.display = 'none';
            document.getElementById(`rbro_menu_item_children${parameter.getId()}`).style.display = 'none';
            document.getElementById(`rbro_menu_item_children_toggle${parameter.getId()}`).style.display = 'none';
        }
        this.addParameter(parameter);
        let maxId = parameter.getMaxId();
        if (maxId >= this.nextId) {
            this.nextId = maxId + 1;
        }
        return parameter;
    }

    /**
     * Creates a style with given data.
     * @param {Object} styleData - Map containing all data for new style, must
     * also contain an unique id.
     * @returns {Style} the created style.
     */
    createStyle(styleData) {
        let style = new Style(styleData.id, styleData, this);
        let parentPanel = this.mainPanel.getStylesItem();
        let panelItem = new MainPanelItem('style', parentPanel, style, { draggable: true }, this);
        style.setPanelItem(panelItem);
        parentPanel.appendChild(panelItem);
        this.addStyle(style);
        if (styleData.id >= this.nextId) {
            this.nextId = styleData.id + 1;
        }
        return style;
    }

    /**
     * Deletes given doc element. Deletes internal object and all
     * related GUI elements (panel item, layout element).
     * @param {DocElement} element - doc element to delete.
     */
    deleteDocElement(element) {
        for (let i=0; i < this.docElements.length; i++) {
            if (this.docElements[i].getId() === element.getId()) {
                this.docElements.splice(i, 1);
                this.deleteDataObject(element);
                this.notifyEvent(element, Command.operation.remove);
                break;
            }
        }
    }

    /**
     * Deletes given parameter. Deletes internal object and all
     * related GUI elements (panel item, layout element).
     * @param {Parameter} parameter - parameter to delete.
     */
    deleteParameter(parameter) {
        this.deleteDataObject(parameter);
        parameter.getPanelItem().getParent().removeChild(parameter.getPanelItem());
        this.notifyEvent(parameter, Command.operation.remove);
    }

    /**
     * Deletes given style. Deletes internal object and all
     * related GUI elements (panel item, layout element).
     * @param {Style} style - style to delete.
     */
    deleteStyle(style) {
        this.deleteDataObject(style);
        style.getPanelItem().getParent().removeChild(style.getPanelItem());
        this.notifyEvent(style, Command.operation.remove);
    }
}
