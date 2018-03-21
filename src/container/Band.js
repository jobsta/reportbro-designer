import Container from './Container';
import DocElement from '../elements/DocElement';
import Document from '../Document';
import * as utils from '../utils';

/**
 * Standard band container for header, content and footer band.
 * @class
 */
export default class Band extends Container {
    constructor(band, id, name, rb) {
        super(id, name, rb);
        this.panelItem = null;
        this.band = band;
        if (band === Document.band.header) {
            this.id = '0_header';
            this.name = rb.getLabel('bandHeader');
        } else if (band === Document.band.content) {
            this.id = '0_content';
            this.name = rb.getLabel('bandContent');
            this.allowAllElements = true;
        } else if (band === Document.band.footer) {
            this.id = '0_footer';
            this.name = rb.getLabel('bandFooter');
        }
        this.el = null;
    }

    /**
     * Called after initialization is finished.
     */
    setup() {
        this.el = this.rb.getDocument().getElement(this.band);
        this.elContent = this.el;
    }

    /**
     * Returns true if the given element type can be added to this container.
     * @param {String} elementType
     */
    isElementAllowed(elementType) {
        if (elementType === DocElement.type.tableText) {
            return false;
        }
        return this.band === Document.band.content || this.band === Document.band.none ||
            (elementType !== DocElement.type.pageBreak && elementType !== DocElement.type.table);
    }

    /**
     * Returns absolute container offset.
     * @returns {Object} x and y offset coordinates.
     */
    getOffset() {
        let y = 0;
        if (this.band === Document.band.none) {
            if (this.owner !== null) {
                y = this.owner.getValue('yVal');
            }
            if (this.parent !== null) {
                y += this.parent.getOffset().y;
            }
        } else {
            let docProperties = this.rb.getDocumentProperties();
            if (this.band === Document.band.content && docProperties.getValue('header')) {
                y = utils.convertInputToNumber(docProperties.getValue('headerSize'));
            } else if (this.band === Document.band.footer) {
                y = this.rb.getDocument().getHeight() - utils.convertInputToNumber(docProperties.getValue('footerSize'));
            }
        }
        return { x: 0, y: y };
    }

    /**
     * Returns container size.
     * @returns {Object} width and height of container.
     */
    getSize() {
        let documentProperties = this.rb.getDocumentProperties();
        let width = documentProperties.getValue('width') -
            documentProperties.getValue('marginLeftVal') - documentProperties.getValue('marginRightVal');
        let height = 0;
        if (this.band === Document.band.none) {
            if (this.owner !== null) {
                height = this.owner.getValue('heightVal');
            }
        } else if (this.band === Document.band.header) {
            height = documentProperties.getValue('headerSizeVal');
        } else if (this.band === Document.band.content) {
            height = documentProperties.getValue('height') - documentProperties.getValue('headerSizeVal') -
                documentProperties.getValue('footerSizeVal') -
                documentProperties.getValue('marginTopVal') - documentProperties.getValue('marginBottomVal');
        } else if (this.band === Document.band.footer) {
            height = documentProperties.getValue('footerSizeVal');
        }
        return { width: width, height: height };
    }
}
