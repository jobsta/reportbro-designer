import Container from './Container';
import DocElement from '../elements/DocElement';
import Document from '../Document';
import * as utils from '../utils';

/**
 * Standard band container for header, content and footer band.
 * @class
 */
export default class Band extends Container {
    constructor(bandType, section, id, name, rb) {
        super(id, name, rb);
        this.panelItem = null;
        this.bandType = bandType;
        this.section = section;
        if (!section) {
            if (bandType === Band.bandType.header) {
                this.id = '0_header';
                this.name = rb.getLabel('bandHeader');
            } else if (bandType === Band.bandType.content) {
                this.id = '0_content';
                this.name = rb.getLabel('bandContent');
                this.allowAllElements = true;
            } else if (bandType === Band.bandType.footer) {
                this.id = '0_footer';
                this.name = rb.getLabel('bandFooter');
            }
        }
        this.el = null;
    }

    /**
     * Called after initialization is finished.
     */
    setup() {
        if (!this.section) {
            this.el = this.rb.getDocument().getElement(this.bandType);
            this.elContent = this.el;
        }
    }

    /**
     * Returns true if the given element type can be added to this container.
     * @param {String} elementType
     */
    isElementAllowed(elementType) {
        if (elementType === DocElement.type.tableText) {
            return false;
        }
        return (this.bandType === Band.bandType.content ||
            (elementType !== DocElement.type.pageBreak && elementType !== DocElement.type.table && elementType !== DocElement.type.section)) &&
            (!this.section || elementType !== DocElement.type.section);
    }

    /**
     * Returns absolute container offset.
     * @returns {Object} x and y offset coordinates.
     */
    getOffset() {
        let y = 0;
        if (this.section) {
            if (this.owner !== null) {
                let absPos = this.owner.getAbsolutePosition();
                y = absPos.y;
            }
        } else {
            let docProperties = this.rb.getDocumentProperties();
            if (this.bandType === Band.bandType.content && docProperties.getValue('header')) {
                y = utils.convertInputToNumber(docProperties.getValue('headerSize'));
            } else if (this.bandType === Band.bandType.footer) {
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
        if (this.section) {
            if (this.owner !== null) {
                height = this.owner.getValue('heightVal');
            }
        } else if (this.bandType === Band.bandType.header) {
            height = documentProperties.getValue('headerSizeVal');
        } else if (this.bandType === Band.bandType.content) {
            height = documentProperties.getValue('height') - documentProperties.getValue('headerSizeVal') -
                documentProperties.getValue('footerSizeVal') -
                documentProperties.getValue('marginTopVal') - documentProperties.getValue('marginBottomVal');
        } else if (this.bandType === Band.bandType.footer) {
            height = documentProperties.getValue('footerSizeVal');
        }
        return { width: width, height: height };
    }
    
    /**
     * Returns container content size. Same as container size.
     * @returns {Object} width and height of container.
     */
    getContentSize() {
        return this.getSize();
    }
    
    isInside(posX, posY) {
        if (this.section && this.owner !== null && this.owner && !this.owner.isVisible()) {
            return false;
        }
        return super.isInside(posX, posY);
    }
}

Band.bandType = {
    header: 'header',
    content: 'content',
    footer: 'footer'
};
