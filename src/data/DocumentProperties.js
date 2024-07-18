import SectionElement from '../elements/SectionElement';
import * as utils from '../utils';

/**
 * Data object containing all document properties like page size, margins, etc.
 * @class
 */
export default class DocumentProperties {
    constructor(rb) {
        this.rb = rb;
        this.id = '0_document_properties';
        this.panelItem = null;
        this.errors = [];

        this.pageFormat = DocumentProperties.pageFormat.A4;
        this.pageWidth = '';
        this.pageHeight = '';
        this.unit = DocumentProperties.unit.mm;
        this.orientation = DocumentProperties.orientation.portrait;
        this.contentHeight = '';
        this.marginLeft = '';
        this.marginLeftVal = 0;
        this.marginTop = '';
        this.marginTopVal = 0;
        this.marginRight = '';
        this.marginRightVal = 0;
        this.marginBottom = '';
        this.marginBottomVal = 0;

        this.header = true;
        this.headerSize = '80';
        this.headerDisplay = DocumentProperties.display.always;
        this.footer = true;
        this.footerSize = '80';
        this.footerDisplay = DocumentProperties.display.always;

        this.headerSizeVal = this.header ? utils.convertInputToNumber(this.headerSize) : 0;
        this.footerSizeVal = this.footer ? utils.convertInputToNumber(this.footerSize) : 0;

        this.watermark = false;

        this.patternLocale = rb.getProperty('patternLocale');
        this.patternCurrencySymbol = rb.getProperty('patternCurrencySymbol');
        this.patternNumberGroupSymbol = rb.getProperty('patternNumberGroupSymbol');

        // width and height in pixel
        this.width = 0;
        this.height = 0;
    }

    setInitialData(initialData) {
        for (let key in initialData) {
            if (initialData.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                this[key] = initialData[key];
            }
        }
        this.headerSizeVal = this.header ? utils.convertInputToNumber(this.headerSize) : 0;
        this.footerSizeVal = this.footer ? utils.convertInputToNumber(this.footerSize) : 0;
        this.marginLeftVal = utils.convertInputToNumber(this.marginLeft);
        this.marginTopVal = utils.convertInputToNumber(this.marginTop);
        this.marginRightVal = utils.convertInputToNumber(this.marginRight);
        this.marginBottomVal = utils.convertInputToNumber(this.marginBottom);
    }

    /**
     * Called after initialization is finished.
     */
    setup() {
        let size = this.getPageSize();
        this.updatePageSize(size);
        this.rb.getDocument().updatePageMargins();
        this.rb.getDocument().updateHeader();
        this.rb.getDocument().updateFooter();
        this.updateHeader();
        this.updateFooter();
        this.updateWatermark();
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        return [
            'pageFormat', 'pageWidth', 'pageHeight', 'unit', 'orientation',
            'contentHeight', 'marginLeft', 'marginTop', 'marginRight', 'marginBottom',
            'header', 'headerSize', 'headerDisplay', 'footer', 'footerSize', 'footerDisplay',
            'watermark', 'patternLocale', 'patternCurrencySymbol', 'patternNumberGroupSymbol',
        ];
    }

    /**
     * Returns all fields of this object that can be modified in the properties panel.
     * @returns {String[]}
     */
    getProperties() {
        return this.getFields();
    }


    getId() {
        return this.id;
    }

    getName() {
        return this.rb.getLabel('documentProperties');
    }

    getPanelItem() {
        return this.panelItem;
    }

    setPanelItem(panelItem) {
        this.panelItem = panelItem;
    }

    getValue(field) {
        return this[field];
    }

    setValue(field, value) {
        this[field] = value;
        if (field === 'marginLeft' || field === 'marginTop' || field === 'marginRight' || field === 'marginBottom') {
            this[field + 'Val'] = utils.convertInputToNumber(value);
            this.rb.getDocument().updatePageMargins();
            this.rb.getDocument().updateHeader();
            this.rb.getDocument().updateFooter();
        } else if (field === 'header') {
            this.updateHeader();
        } else if (field === 'footer') {
            this.updateFooter();
        } else if (field === 'watermark') {
            this.updateWatermark();
        }

        if (field === 'header' || field === 'headerSize') {
            this.rb.getDocument().updateHeader();
            this.headerSizeVal = this.header ? utils.convertInputToNumber(this.headerSize) : 0;
        }  else if (field === 'footer' || field === 'footerSize') {
            this.rb.getDocument().updateFooter();
            this.footerSizeVal = this.footer ? utils.convertInputToNumber(this.footerSize) : 0;
        } else if (field === 'pageFormat' ||field === 'pageWidth' || field === 'pageHeight' || field === 'unit' ||
                field === 'orientation' || field === 'contentHeight' ||
                field === 'marginTop' || field === 'marginBottom') {
            let size = this.getPageSize();
            this.updatePageSize(size);
        }
    }

    /**
     * Returns value to use for updating input control.
     * Can be overridden in case update value can be different from internal value, e.g.
     * width for table cells with colspan > 1.
     * @param {String} field - field name.
     * @param {String} value - value for update.
     */
    getUpdateValue(field, value) {
        return value;
    }

    updatePageSize(size) {
        this.width = size.width;
        this.height = size.height;
        this.rb.getDocument().updatePageSize(size.width, size.height);

        // update width of all elements which cover full width
        let docElements = this.rb.getDocElements(true);
        for (let docElement of docElements) {
            if (docElement instanceof SectionElement) {
                docElement.setWidth(size.width);
            }
        }
        this.rb.getDocument().pageSizeChanged();
    }

    updateHeader() {
        if (this.header) {
            this.rb.getMainPanel().showHeader();
        } else {
            this.rb.getMainPanel().hideHeader();
        }
    }

    updateFooter() {
        if (this.footer) {
            this.rb.getMainPanel().showFooter();
        } else {
            this.rb.getMainPanel().hideFooter();
        }
    }

    updateWatermark() {
        if (this.watermark) {
            this.rb.getMainPanel().showWatermarks();
        } else {
            this.rb.getMainPanel().hideWatermarks();
        }
    }

    /**
     * Returns page size in pixels at 72 dpi.
     * @returns {Object} width, height
     */
    getPageSize() {
        let pageWidth;
        let pageHeight;
        let unit;
        let dpi = 72;
        if (this.pageFormat === DocumentProperties.pageFormat.A4) {
            if (this.orientation === DocumentProperties.orientation.portrait) {
                pageWidth = 210;
                pageHeight = 297;
            } else {
                pageWidth = 297;
                pageHeight = 210;
            }
            unit = DocumentProperties.unit.mm;
        } else if (this.pageFormat === DocumentProperties.pageFormat.A5) {
            if (this.orientation === DocumentProperties.orientation.portrait) {
                pageWidth = 148;
                pageHeight = 210;
            } else {
                pageWidth = 210;
                pageHeight = 148;
            }
            unit = DocumentProperties.unit.mm;
        } else if (this.pageFormat === DocumentProperties.pageFormat.letter) {
            if (this.orientation === DocumentProperties.orientation.portrait) {
                pageWidth = 8.5;
                pageHeight = 11;
            } else {
                pageWidth = 11;
                pageHeight = 8.5;
            }
            unit = DocumentProperties.unit.inch;
        } else {
            pageWidth = utils.convertInputToNumber(this.pageWidth);
            pageHeight = utils.convertInputToNumber(this.pageHeight);
            unit = this.unit;
        }
        if (unit === DocumentProperties.unit.mm) {
            pageWidth = Math.round((dpi * pageWidth) / 25.4);
            pageHeight = Math.round((dpi * pageHeight) / 25.4);
        } else {
            pageWidth = Math.round(dpi * pageWidth);
            pageHeight = Math.round(dpi * pageHeight);
        }
        if (this.contentHeight.trim() !== '') {
            pageHeight = utils.convertInputToNumber(this.contentHeight) +
                    this.marginTopVal + this.marginBottomVal + this.headerSizeVal + this.footerSizeVal;
        }
        return { width: pageWidth, height: pageHeight };
    }

    /**
     * Returns size of content band without any margins.
     * @returns {Object} width, height
     */
    getContentSize() {
        let size = this.getPageSize();
        let height;
        if (this.contentHeight.trim() !== '') {
            height = utils.convertInputToNumber(this.contentHeight);
        } else {
            height = size.height - this.marginTopVal - this.marginBottomVal -
                this.headerSizeVal - this.footerSizeVal;
        }
        return { width: size.width - this.marginLeftVal - this.marginRightVal,
            height: height };
    }

    addError(error) {
        this.errors.push(error);
    }

    clearErrors() {
        this.errors = [];
    }

    getErrors() {
        return this.errors;
    }

    remove() {
    }

    select() {
    }

    deselect() {
    }

    toJS() {
        let ret = {};
        for (let field of this.getFields()) {
            ret[field] = this.getValue(field);
        }
        return ret;
    }

    /**
     * Returns class name.
     * This can be useful for introspection when the class names are mangled
     * due to the webpack uglification process.
     * @returns {string}
     */
    getClassName() {
        return 'DocumentProperties';
    }
}

DocumentProperties.outputFormat = {
    pdf: 'pdf',
    xlsx: 'xlsx'
};

DocumentProperties.pageFormat = {
    A4: 'A4',
    A5: 'A5',
    letter: 'letter', // 215.9 x 279.4 mm
    userDefined: 'user_defined'
};

DocumentProperties.unit = {
    mm: 'mm',
    inch: 'inch'
};

DocumentProperties.orientation = {
    portrait: 'portrait',
    landscape: 'landscape'
};

DocumentProperties.display = {
    always: 'always',
    notOnFirstPage: 'not_on_first_page'
};
