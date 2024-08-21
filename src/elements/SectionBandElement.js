import DocElement from './DocElement';
import Band from '../container/Band';
import * as utils from '../utils';

/**
 * Section band doc element. This is the header, content or footer of a custom section.
 *  All Elements inside the band are positioned relative.
 * @class
 */
export default class SectionBandElement extends DocElement {
    constructor(id, initialData, bandType, rb) {
        let name = (bandType === Band.bandType.header) ?
            rb.getLabel('bandHeader') :
            ((bandType === Band.bandType.footer) ? rb.getLabel('bandFooter') : rb.getLabel('bandContent'));
        super(name, id, 0, 100, rb);
        this.setupComplete = false;
        this.band = null;
        this.bandType = bandType;
        this.repeatHeader = false;
        this.backgroundColor = '';
        this.alternateBackgroundColor = '';
        this.alwaysPrintOnSamePage = true;
        this.shrinkToContentHeight = false;
        this.parentId = initialData.parentId;

        this.heightVal = 0;
        this.visible = (bandType === Band.bandType.content);

        this.setInitialData(initialData);
    }

    setup() {
        this.createElement();
        this.updateDisplay();
        this.updateStyle();

        if (this.linkedContainerId === null) {
            this.linkedContainerId = this.rb.getUniqueId();
        }
        this.band = new Band(
            this.bandType, true, this.linkedContainerId, 'section_' + this.bandType + '_' + this.linkedContainerId,
            this.rb);
        this.band.init(this);
        this.rb.addContainer(this.band);
        this.setupComplete = true;
    }

    /**
     * Do not register any event handlers so element cannot be selected.
     */
    registerEventHandlers() {
    }

    /**
     * Returns highest id of this component, this is the id of the linked container because it is
     * created after the band element.
     * @returns {Number}
     */
    getMaxId() {
        return this.linkedContainerId;
    }

    /**
     * Returns absolute position inside document.
     * @returns {Object} x and y coordinates.
     */
    getAbsolutePosition() {
        let pos = { x: 0, y: 0 };
        let parent = this.getParent();
        if (parent !== null) {
            pos = parent.getAbsolutePosition();
        }
        pos.y += this.yVal;
        return pos;
    }

    setValue(field, value) {
        super.setValue(field, value);

        if (field === 'height') {
            this[field + 'Val'] = utils.convertInputToNumber(value);
            let parent = this.getParent();
            if (parent !== null) {
                parent.updateBands(this);
            }
        } else if (field === 'backgroundColor') {
            this.updateStyle();
        }
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        let fields = this.getProperties();
        fields.splice(0, 0, 'id', 'containerId', 'linkedContainerId');
        return fields;
    }

    /**
     * Returns all fields of this object that can be modified in the properties panel.
     * @returns {String[]}
     */
    getProperties() {
        let fields = ['height', 'styleId', 'backgroundColor', 'shrinkToContentHeight'];
        if (this.bandType === Band.bandType.header) {
            fields.push('repeatHeader');
        } else {
            fields.push('alwaysPrintOnSamePage');
            fields.push('shrinkToContentHeight');
            if (this.bandType === Band.bandType.content) {
                fields.push('alternateBackgroundColor');
            }
        }
        return fields;
    }

    updateDisplayInternal(x, y, width, height) {
        if (this.el !== null) {
            this.el.style.top = this.rb.toPixel(y);
            this.el.style.width = '100%';
            this.el.style.height = this.rb.toPixel(height);
            if (this.setupComplete) {
                // update section element because section band dividers are contained in section
                let parent = this.getParent();
                if (parent !== null) {
                    parent.updateHeight(this, height);
                }
            }
        }
    }

    updateStyle() {
        this.el.style.backgroundColor = this.backgroundColor;
    }

    select() {
        super.select();
        this.el.classList.add('rbroHighlightBandDescription');
    }

    deselect() {
        super.deselect();
        this.el.classList.remove('rbroHighlightBandDescription');
    }

    /**
     * Returns allowed sizers when element is selected.
     * @returns {String[]}
     */
    getSizers() {
        return ['S'];
    }

    getHeight() {
        return this.heightVal;
    }

    isAreaSelectionAllowed() {
        return false;
    }

    isDraggingAllowed() {
        return false;
    }

    createElement() {
        this.el = utils.createElement(
            'div', { id: `rbro_el${this.id}`, class: 'rbroSectionBandElement rbroElementContainer' });
        this.el.append(utils.createElement(
            'div', {
                id: `rbro_el_band_description${this.id}`, class: 'rbroDocumentBandDescription'
            }));
        document.getElementById(`rbro_el${this.parentId}`).append(this.el);
    }

    getContentElement() {
        return this.el;
    }

    getParent() {
        return this.rb.getDataObject(this.parentId);
    }

    show(visible) {
        this.visible = visible;
        if (visible) {
            this.el.classList.remove('rbroHidden');
        } else {
            this.el.classList.add('rbroHidden');
        }
    }

    isVisible() {
        return this.visible;
    }

    /**
     * Returns class name.
     * This can be useful for introspection when the class names are mangled
     * due to the webpack uglification process.
     * @returns {string}
     */
    getClassName() {
        return 'SectionBandElement';
    }
}
