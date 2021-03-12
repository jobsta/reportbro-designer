import DocElement from './DocElement';
import Band from '../container/Band';
import Document from '../Document';
import * as utils from '../utils';

/**
 * Section band doc element. This is the header, content or footer of a custom section.
 *  All Elements inside the band are positioned relative.
 * @class
 */
export default class SectionBandElement extends DocElement {
    constructor(id, initialData, bandType, rb) {
        let name = (bandType === Band.bandType.header) ?
            rb.getLabel('bandHeader') : ((bandType === Band.bandType.footer) ? rb.getLabel('bandFooter') : rb.getLabel('bandContent'));
        super(name, id, 0, 100, rb);
        this.setupComplete = false;
        this.band = null;
        this.bandType = bandType;
        this.repeatHeader = false;
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
        this.band = new Band(this.bandType, true, this.linkedContainerId, 'section_' + this.bandType + '_' + this.linkedContainerId, this.rb);
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
        let fields;
        if (this.bandType === Band.bandType.header) {
            fields = ['height', 'repeatHeader', 'shrinkToContentHeight'];
        } else {
            fields = ['height', 'alwaysPrintOnSamePage', 'shrinkToContentHeight'];
        }
        return fields;
    }

    updateDisplayInternal(x, y, width, height) {
        if (this.el !== null) {
            let props = { top: this.rb.toPixel(y), width: '100%', height: this.rb.toPixel(height) };
            this.el.css(props);
            if (this.setupComplete) {
                // update section element because section band dividers are contained in section
                let parent = this.getParent();
                if (parent !== null) {
                    parent.updateHeight(this, height);
                }
            }
        }
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
        this.el = $(`<div id="rbro_el${this.id}" class="rbroSectionBandElement rbroElementContainer"></div>`);
        this.el.append($(`<div class="rbroDocumentBandDescription">${this.rb.getLabel('docElementSection')} ${this.name}</div>`));
        $(`#rbro_el${this.parentId}`).append(this.el);
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
            $(`#rbro_el${this.id}`).removeClass('rbroHidden');
        } else {
            $(`#rbro_el${this.id}`).addClass('rbroHidden');
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
