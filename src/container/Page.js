import Container from './Container';

/**
 * Page container to hold elements for page background, e.g. watermark elements.
 * @class
 */
export default class Page extends Container {
    constructor(id, name, rb) {
        super(id, name, rb);
    }

    /**
     * Called after initialization is finished.
     */
    setup() {
        this.el = this.rb.getDocument().getPageElement();
        this.elContent = this.el;
    }

    /**
     * Returns container size.
     * @returns {Object} width and height of container.
     */
    getSize() {
        const documentProperties = this.rb.getDocumentProperties();
        return { width: documentProperties.getValue('width'), height: documentProperties.getValue('height') };
    }

    /**
     * Returns container content size. Same as container size.
     * @returns {Object} width and height of container.
     */
    getContentSize() {
        return this.getSize();
    }
}
