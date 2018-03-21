import DocElement from './DocElement';
import AddDeleteDocElementCmd from '../commands/AddDeleteDocElementCmd';
import Band from '../container/Band';
import SetValueCmd from '../commands/SetValueCmd';
import MainPanelItem from '../menu/MainPanelItem';
import Document from '../Document';
import * as utils from '../utils';

/**
 * Band element. Bands can be added to the content band and can contain other Bands. All Elements inside
 * the band are positioned relative.
 * @class
 */
export default class BandElement extends DocElement {
    constructor(id, initialData, rb) {
        super(rb.getLabel('docElementBand'), id, -1, 60, rb);
        this.band = null;
        this.setupComplete = false;
        this.dataSource = '';
        this.label = '';
        
        this.shrinkToContentHeight = false;
        
        this.setInitialData(initialData);
    }

    setup() {
        super.setup();
        this.createElement();
        this.updateDisplay();

        if (this.linkedContainerId === null) {
            this.linkedContainerId = this.rb.getUniqueId();
        }
        this.band = new Band(Document.band.none, this.linkedContainerId, 'band_' + this.linkedContainerId, this.rb);
        this.band.init(this);
        this.rb.addContainer(this.band);

        this.setupComplete = true;
        this.updateStyle();
        this.updateName();
        this.panelItem.open();
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
    
    setValue(field, value, elSelector, isShown) {
        super.setValue(field, value, elSelector, isShown);

        if (field === 'label' || field === 'dataSource') {
            this.updateName();
        }
    }

    updateDisplayInternal(x, y, width, height) {
        if (this.el !== null) {
            let props = { left: this.rb.toPixel(0), top: this.rb.toPixel(y),
                width: '100%', height: this.rb.toPixel(height) };
            // props['background-color'] = '#c07839';
            this.el.css(props);
        }

        let styleProperties = {};
        styleProperties['width'] = '100%';
        styleProperties['height'] = this.rb.toPixel(height);
        $(`#rbro_el_content_band${this.id}`).css(styleProperties);
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        return ['id', 'containerId', 'linkedContainerId', 'dataSource', 'label', 'y', 'height', 'printIf',
            'removeEmptyElement', 'shrinkToContentHeight'];
    }

    getElementType() {
        return DocElement.type.band;
    }

    /**
     * Returns allowed sizers when element is selected.
     * @returns {String[]}
     */
    getSizers() {
        return [];
    }

    getYTagId() {
        return 'rbro_band_element_position_y';
    }

    getHeightTagId() {
        return 'rbro_band_element_height';
    }

    createElement() {
        this.el = $(`<div id="rbro_el${this.id}" class="rbroDocElement rbroBandElement rbroElementContainer"></div>`);
        // rbroContentContainerHelper contains border styles
        // rbroDocElementContentBand contains height
        this.el
//            .append($(`<div id="rbro_el_content${this.id}" class="rbroContentContainerHelper"></div>`)
                .append($(`<div id="rbro_el_content_band${this.id}" class="rbroDocElementContentBand"></div>`));
//            );
        this.appendToContainer();
        this.registerEventHandlers();
    }

    getContentElement() {
        return $(`#rbro_el_content_band${this.id}`);
    }

    remove() {
        super.remove();
        this.rb.deleteContainer(this.band);
    }

    updateName() {
        this.name = this.rb.getLabel('docElementBand');
        if (this.dataSource.trim() !== '') {
            this.name += ' ' + this.dataSource;
        }
        // if (this.label.trim() !== '') {
        //     this.name = this.label;
        // } else {
        //     this.name = this.rb.getLabel('docElementBand');
        // }
        $(`#rbro_menu_item_name${this.id}`).text(this.name);
    }

    /**
     * Returns all child parameters of the data source parameter (which must be an array parameter).
     * @returns {Parameter[]}
     */
    getDataParameters() {
        let parameters = [];
        let dataSource = this.dataSource.trim();
        if (dataSource.length >= 3 && dataSource.substr(0, 2) === '${' &&
                dataSource.charAt(dataSource.length - 1) === '}') {
            let dataSourceParameter = dataSource.substring(2, dataSource.length - 1);
            let param = this.rb.getParameterByName(dataSourceParameter);
            if (param !== null) {
                parameters = param.getChildren();
            }
        }
        return parameters;
    }

    /**
     * Adds SetValue commands to command group parameter in case the specified parameter is used in any of
     * the object fields.
     * @param {String} oldParameterName
     * @param {String} newParameterName
     * @param {CommandGroupCmd} cmdGroup - possible SetValue commands will be added to this command group.
     */
    addCommandsForChangedParameter(oldParameterName, newParameterName, cmdGroup) {
        if (this.printIf.indexOf(oldParameterName) !== -1) {
            let cmd = new SetValueCmd(this.id, 'rbro_band_element_print_if', 'printIf',
                utils.replaceAll(this.printIf, oldParameterName, newParameterName), SetValueCmd.type.text, this.rb);
            cmdGroup.addCommand(cmd);
        }
    }

    toJS() {
        let ret = super.toJS();
        return ret;
    }
}