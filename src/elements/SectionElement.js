import DocElement from './DocElement';
import SectionBandElement from './SectionBandElement';
import Band from '../container/Band';
import MainPanelItem from '../menu/MainPanelItem';
import * as utils from '../utils';

/**
 * Section element. Sections can be added to the content band and contain a content band and optional
 * header/footer bands.
 * @class
 */
export default class SectionElement extends DocElement {
    constructor(id, initialData, rb) {
        super(rb.getLabel('docElementSection'), id, -1, 60, rb);
        this.setupComplete = false;
        this.elDividerHeader = null;
        this.elDividerFooter = null;
        this.elDividerBottom = null;
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
        this.updateHeight(null, -1);

        this.setWidth(this.getContainerContentSize().width);

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
        if ((bandType === Band.bandType.header && !this.header) ||
            (bandType === Band.bandType.footer && !this.footer)) {
            panelItemProperties.visible = false;
        }
        let bandElement = new SectionBandElement(dataId, data, bandType, this.rb);
        this.rb.addDataObject(bandElement);
        let panelItemBand = new MainPanelItem(
            'sectionBand', this.panelItem, bandElement, panelItemProperties, this.rb);
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
     * Register event handler for a container element so it can be dragged and
     * allow selection on double click.
     */
    registerEventHandlers() {
        super.registerContainerEventHandlers();
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

    appendContainerChildren(elements) {
        if (this.headerData !== null) {
            this.headerData.appendContainerChildren(elements);
        }
        if (this.contentData !== null) {
            this.contentData.appendContainerChildren(elements);
        }
        if (this.footerData !== null) {
            this.footerData.appendContainerChildren(elements);
        }
    }

    setValue(field, value) {
        super.setValue(field, value);

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
            this.el.style.top = this.rb.toPixel(y);
            this.el.style.width = '100%';
            this.el.style.height = this.rb.toPixel(height);
        }
    }

    /**
     * Returns all fields of this object that can be modified in the properties panel.
     * @returns {String[]}
     */
    getProperties() {
        return ['y', 'label', 'dataSource', 'header', 'footer', 'printIf'];
    }

    getElementType() {
        return DocElement.type.section;
    }

    select() {
        super.select();
        let elSizerContainer = this.getSizerContainerElement();
        // create sizers (to indicate selection) which do not support resizing
        for (let sizer of ['N', 'S']) {
            elSizerContainer.append(
                utils.createElement('div', { class: `rbroSizer rbroSizer${sizer} rbroSizerMove` }));
        }

        if (this.headerData !== null) {
            document.getElementById(`rbro_el${this.headerData.getId()}`).classList.add('rbroHighlightBandDescription');
        }
        if (this.contentData !== null) {
            document.getElementById(`rbro_el${this.contentData.getId()}`).classList.add('rbroHighlightBandDescription');
        }
        if (this.footerData !== null) {
            document.getElementById(`rbro_el${this.footerData.getId()}`).classList.add('rbroHighlightBandDescription');
        }
    }

    deselect() {
        super.deselect();
        const elBandDescriptions = this.el.querySelectorAll('.rbroSectionBandElement');
        for (const elBandDescription of elBandDescriptions) {
            elBandDescription.classList.remove('rbroHighlightBandDescription');
        }
    }

    /**
     * Returns allowed sizers when element is selected.
     * @returns {String[]}
     */
    getSizers() {
        return [];
    }

    isAreaSelectionAllowed() {
        return false;
    }

    isDroppingAllowed() {
        return false;
    }

    createElement() {
        this.el = utils.createElement('div', { id: `rbro_el${this.id}`, class: 'rbroDocElement rbroSectionElement' });
        this.el.append(
            utils.createElement('div', {
                id: `rbro_divider_section_top${this.id}`,
                class: 'rbroDivider rbroDividerSection',
                style: 'top: 0px'
            })
        );
        this.elDividerHeader = utils.createElement(
            'div', {
                id: `rbro_divider_section_header${this.id}`,
                class: 'rbroDivider rbroDividerSectionBand rbroHidden'
            });
        this.el.append(this.elDividerHeader);
        this.elDividerFooter = utils.createElement(
            'div', {
                id: `rbro_divider_section_footer${this.id}`,
                class: 'rbroDivider rbroDividerSectionBand rbroHidden'
            });
        this.el.append(this.elDividerFooter);
        this.elDividerBottom = utils.createElement(
            'div', {
                id: `rbro_divider_section_bottom${this.id}`,
                class: 'rbroDivider rbroDividerSection'
            });
        this.el.append(this.elDividerBottom);
        this.appendToContainer();
        this.registerEventHandlers();
    }

    remove() {
        super.remove();
        // delete containers of section bands
        if (this.headerData !== null) {
            this.rb.deleteContainer(this.headerData.getLinkedContainer());
        }
        if (this.contentData !== null) {
            this.rb.deleteContainer(this.contentData.getLinkedContainer());
        }
        if (this.footerData !== null) {
            this.rb.deleteContainer(this.footerData.getLinkedContainer());
        }
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
        if (this.headerData !== null) {
            document.getElementById(`rbro_el_band_description${this.headerData.getId()}`).textContent =
                this.name + ' ' + this.headerData.getName();
        }
        if (this.contentData !== null) {
            document.getElementById(`rbro_el_band_description${this.contentData.getId()}`).textContent =
                this.name + ' ' + this.contentData.getName();
        }
        if (this.footerData !== null) {
            document.getElementById(`rbro_el_band_description${this.footerData.getId()}`).textContent =
                this.name + ' ' + this.footerData.getName();
        }
        document.getElementById(`rbro_menu_item_name${this.id}`).textContent = this.name;
    }

    /**
     * Set internal width and width of all bands. Should be called whenever the document size changes.
     * @param {Number} width - total band width.
     */
    setWidth(width) {
        this.widthVal = width;
        this.width = '' + width;
        if (this.headerData !== null) {
            this.headerData.widthVal = width;
            this.headerData.width = '' + width;
        }
        if (this.contentData !== null) {
            this.contentData.widthVal = width;
            this.contentData.width = '' + width;
        }
        if (this.footerData !== null) {
            this.footerData.widthVal = width;
            this.footerData.width = '' + width;
        }
    }

    /**
     * Update section element height and position, visibility of dividers for header/footer bands.
     * @param {SectionBandElement} band - if not null the bandHeight parameter will be used for band height
     * instead of the actual stored height value. This is needed to update the divider display during drag
     * of section band height.
     * @param {Number} bandHeight - used band height for given band parameter instead of stored height value.
    */
    updateHeight(band, bandHeight) {
        let height = 0;
        if (this.header && this.headerData !== null) {
            if (band === this.headerData) {
                height += bandHeight;
            } else {
                height += this.headerData.getValue('heightVal');
            }
            this.elDividerHeader.style.top = this.rb.toPixel(height);
            this.elDividerHeader.classList.remove('rbroHidden');
        } else {
            this.elDividerHeader.classList.add('rbroHidden');
        }
        if (this.contentData !== null) {
            if (band === this.contentData) {
                height += bandHeight;
            } else {
                height += this.contentData.getValue('heightVal');
            }
        }
        if (this.footer && this.footerData !== null) {
            this.elDividerFooter.style.top = this.rb.toPixel(height);
            this.elDividerFooter.classList.remove('rbroHidden');
            if (band === this.footerData) {
                height += bandHeight;
            } else {
                height += this.footerData.getValue('heightVal');
            }
        } else {
            document.getElementById(`rbro_divider_section_footer${this.id}`).classList.add('rbroHidden');
        }
        this.elDividerBottom.style.top = this.rb.toPixel(height);
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
                    this.headerData.setValue('y', '' + y);
                }
                y += this.headerData.getValue('heightVal');
            }
            if (this.contentData !== ignoreBandData) {
                this.contentData.setValue('y', '' + y);
            }
            y += this.contentData.getValue('heightVal');
            if (this.footer && this.footerData !== ignoreBandData) {
                this.footerData.setValue('y', '' + y);
            }
        }
        this.updateHeight(null, -1);
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

    hasDataSource() {
        return true;
    }

    addChildren(docElements) {
        docElements.push(this.headerData);
        docElements.push(this.contentData);
        docElements.push(this.footerData);
        // children of section bands will be added through linked containers of section
    }

    /**
     * Adds SetValue commands to command group parameter in case the specified parameter is used in any of
     * the object fields.
     * @param {Parameter} parameter - parameter which will be renamed.
     * @param {String} newParameterName - new name of the parameter.
     * @param {CommandGroupCmd} cmdGroup - possible SetValue commands will be added to this command group.
     */
    addCommandsForChangedParameterName(parameter, newParameterName, cmdGroup) {
        this.addCommandForChangedParameterName(parameter, newParameterName, 'dataSource', cmdGroup);
        this.addCommandForChangedParameterName(parameter, newParameterName, 'printIf', cmdGroup);
    }

    toJS() {
        const rv = super.toJS();
        rv['headerData'] = this.headerData.toJS();
        rv['contentData'] = this.contentData.toJS();
        rv['footerData'] = this.footerData.toJS();
        return rv;
    }

    /**
     * Returns class name.
     * This can be useful for introspection when the class names are mangled
     * due to the webpack uglification process.
     * @returns {string}
     */
    getClassName() {
        return 'SectionElement';
    }
}
