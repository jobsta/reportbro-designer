import DocElement from './DocElement';
import SectionBandElement from './SectionBandElement';
import Band from '../container/Band';
import Parameter from '../data/Parameter';
import MainPanelItem from '../menu/MainPanelItem';

/**
 * Section element. Sections can be added to the content band and contain a content band and optional
 * header/footer bands.
 * @class
 */
export default class SectionElement extends DocElement {
    constructor(id, initialData, rb) {
        super(rb.getLabel('docElementSection'), id, -1, 60, rb);
        this.setupComplete = false;
        this.dataSource = '';
        this.label = '';
        this.header = false;
        this.footer = false;
        this.headerData = null;
        this.contentData = null;
        this.footerData = null;

        this.setInitialData(initialData);
    }

    setup(openPanelItem) {
        super.setup(openPanelItem);
        this.createElement();
        this.updateDisplay();

        this.headerData = this.createBand(Band.bandType.header, null);
        this.contentData = this.createBand(Band.bandType.content, null);
        this.footerData = this.createBand(Band.bandType.footer, null);
        this.updateHeight();

        this.setupComplete = true;
        this.updateName();
        if (openPanelItem) {
            this.panelItem.open();
        }
    }

    createBand(bandType, dataValues) {
        let data;
        let dataKey = bandType + 'Data';
        let dataId;
        let panelItemProperties = { hasChildren: true, showDelete: false };
        if (dataValues) {
            data = dataValues;
        } else if (this[dataKey]) {
            data = this[dataKey];
            dataId = data.id;
        } else {
            data = {};
        }
        data.parentId = this.id;
        data.containerId = this.containerId;
        if (!dataId) {
            dataId = this.rb.getUniqueId();
        }
        let y = 0;
        if (bandType === Band.bandType.header) {
            data.y = '' + y;
        } else if (bandType === Band.bandType.content) {
            if (this.header && this.headerData !== null) {
                y += this.headerData.getValue('heightVal');
            }
            data.y = '' + y;
        } else if (bandType === Band.bandType.footer) {
            if (this.header && this.headerData !== null) {
                y += this.headerData.getValue('heightVal');
            }
            if (this.contentData !== null) {
                y += this.contentData.getValue('heightVal');
            }
            data.y = '' + y;
        }
        if ((bandType === Band.bandType.header && !this.header) || (bandType === Band.bandType.footer && !this.footer)) {
            panelItemProperties.visible = false;
        }
        let bandElement = new SectionBandElement(dataId, data, bandType, this.rb);
        this.rb.addDataObject(bandElement);
        let panelItemBand = new MainPanelItem('section_band', this.panelItem, bandElement, panelItemProperties, this.rb);
        bandElement.setPanelItem(panelItemBand);
        this.panelItem.appendChild(panelItemBand);
        bandElement.setup();

        if (bandType === Band.bandType.header) {
            bandElement.show(this.header);
        } else if (bandType === Band.bandType.footer) {
            bandElement.show(this.footer);
        }
        return bandElement;
    }

    /**
     * Do not register any event handlers so element cannot be selected.
     */
    registerEventHandlers() {
    }
    
    /**
     * Returns highest id of this component, this is the max id of the footer band because it is created last.
     * @returns {Number}
     */
    getMaxId() {
        let id = this.id;
        if (this.footerData !== null) {
            id = this.footerData.getMaxId();
        }
        return id;
    }

    setValue(field, value, elSelector, isShown) {
        super.setValue(field, value, elSelector, isShown);

        if (field === 'label' || field === 'dataSource') {
            this.updateName();
        } else if (field === 'header') {
            this.headerData.show(value);
            if (value) {
                this.headerData.getPanelItem().show();
            } else {
                this.headerData.getPanelItem().hide();
            }
        } else if (field === 'footer') {
            this.footerData.show(value);
            if (value) {
                this.footerData.getPanelItem().show();
            } else {
                this.footerData.getPanelItem().hide();
            }
        } else if (field === 'containerId') {
            this.headerData.containerId = value;
            this.contentData.containerId = value;
            this.footerData.containerId = value;
        }
        if (field === 'header' || field === 'footer') {
            this.updateBands(null);
        }
    }

    updateDisplayInternal(x, y, width, height) {
        if (this.el !== null) {
            let props = { top: this.rb.toPixel(y), width: '100%', height: this.rb.toPixel(height) };
            this.el.css(props);
        }
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        return ['id', 'containerId', 'y', 'label', 'dataSource', 'header', 'footer', 'printIf'];
    }

    getElementType() {
        return DocElement.type.section;
    }

    /**
     * Returns allowed sizers when element is selected.
     * @returns {String[]}
     */
    getSizers() {
        return [];
    }

    getYTagId() {
        return 'rbro_section_element_position_y';
    }

    getHeightTagId() {
        return '';
    }

    isDroppingAllowed() {
        return false;
    }

    createElement() {
        this.el = $(`<div id="rbro_el${this.id}" class="rbroSectionElement"></div>`);
        this.el.append($(`<div id="rbro_divider_section_top${this.id}" class="rbroDivider rbroDividerSection" style="top: 0px"></div>`));
        this.el.append($(`<div id="rbro_divider_section_header${this.id}" class="rbroDivider rbroDividerSectionBand rbroHidden"></div>`));
        this.el.append($(`<div id="rbro_divider_section_footer${this.id}" class="rbroDivider rbroDividerSectionBand rbroHidden"></div>`));
        this.el.append($(`<div id="rbro_divider_section_bottom${this.id}" class="rbroDivider rbroDividerSection"></div>`));
        this.appendToContainer();
    }

    updateName() {
        if (this.label.trim() !== '') {
            this.name = this.label;
        } else {
            this.name = this.rb.getLabel('docElementSection');
            if (this.dataSource.trim() !== '') {
                this.name += ' ' + this.dataSource;
            }
        }
        $(`#rbro_menu_item_name${this.id}`).text(this.name);
    }

    /**
     * Update section element height and position, visibility of dividers for header/footer bands.
    */
    updateHeight() {
        let height = 0;
        if (this.header && this.headerData !== null) {
            height += this.headerData.getValue('heightVal');
            $(`#rbro_divider_section_header${this.id}`).css({ top: this.rb.toPixel(height) }).removeClass('rbroHidden');
        } else {
            $(`#rbro_divider_section_header${this.id}`).addClass('rbroHidden');
        }
        if (this.contentData !== null) {
            height += this.contentData.getValue('heightVal');
        }
        if (this.footer && this.footerData !== null) {
            $(`#rbro_divider_section_footer${this.id}`).css({ top: this.rb.toPixel(height) }).removeClass('rbroHidden');
            height += this.footerData.getValue('heightVal');
        } else {
            $(`#rbro_divider_section_footer${this.id}`).addClass('rbroHidden');
        }
        $(`#rbro_divider_section_bottom${this.id}`).css({ top: this.rb.toPixel(height) });
        this.height = '' + height;
        this.heightVal = height;
        this.updateDisplay();
    }

    /**
     * Update height and y-coordinate of all sub-bands (header, content, footer).
     */
    updateBands(ignoreBandData) {
        if (this.setupComplete) {
            let y = 0;
            if (this.header) {
                if (this.headerData !== ignoreBandData) {
                    this.headerData.setValue('y', '' + y, null, true);
                }
                y += this.headerData.getValue('heightVal');
            }
            if (this.contentData !== ignoreBandData) {
                this.contentData.setValue('y', '' + y, null, true);
            }
            y += this.contentData.getValue('heightVal');
            if (this.footer && this.footerData !== ignoreBandData) {
                this.footerData.setValue('y', '' + y, null, true);
            }
        }
        this.updateHeight();
    }

    /**
     * Get linked containers of all bands.
     * @returns {Container[]} array with all linked containers of header/content/footer section bands.
     */
    getLinkedContainers() {
        let containers = [];
        let container;
        for (let band of ['headerData', 'contentData', 'footerData']) {
            if (this[band] !== null) {
                container = this[band].getLinkedContainer();
                if (container !== null) {
                    containers.push(container);
                }
            }
        }
        return containers;
    }

    /**
     * Returns all parameters of the data source (which must be an array parameter).
     * @returns {[Object]} contains the data source name and all parameters of the data source.
     */
    getDataSource() {
        let parameters = [];
        let dataSource = this.dataSource.trim();
        let dataSourceParameter = '';
        if (dataSource.length >= 3 && dataSource.substr(0, 2) === '${' &&
                dataSource.charAt(dataSource.length - 1) === '}') {
            dataSourceParameter = dataSource.substring(2, dataSource.length - 1);
            let param = this.rb.getParameterByName(dataSourceParameter);
            if (param !== null && param.getValue('type') === Parameter.type.array) {
                parameters = param.getChildren();
            }
        }
        return { name: dataSourceParameter, parameters: parameters };
    }

    /**
     * Adds SetValue commands to command group parameter in case the specified parameter is used in any of
     * the object fields.
     * @param {Parameter} parameter - parameter which will be renamed.
     * @param {String} newParameterName - new name of the parameter.
     * @param {CommandGroupCmd} cmdGroup - possible SetValue commands will be added to this command group.
     */
    addCommandsForChangedParameterName(parameter, newParameterName, cmdGroup) {
        this.addCommandForChangedParameterName(parameter, newParameterName, 'rbro_section_element_data_source', 'dataSource', cmdGroup);
        this.addCommandForChangedParameterName(parameter, newParameterName, 'rbro_section_element_print_if', 'printIf', cmdGroup);
    }

    toJS() {
        let ret = super.toJS();
        ret['headerData'] = this.headerData.toJS();
        ret['contentData'] = this.contentData.toJS();
        ret['footerData'] = this.footerData.toJS();
        return ret;
    }
}
