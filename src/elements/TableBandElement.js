import DocElement from './DocElement';
import TableTextElement from './TableTextElement';
import Band from '../container/Band';
import MainPanelItem from '../menu/MainPanelItem';
import * as utils from '../utils';

/**
 * Table band doc element. This is the header, content or footer of a table.
 * @class
 */
export default class TableBandElement extends DocElement {
    constructor(id, initialData, bandType, rb) {
        let name = (bandType === 'header') ? rb.getLabel('bandHeader') : ((bandType === 'footer') ? rb.getLabel('bandFooter') : rb.getLabel('bandContent'));
        super(name, id, 0, 20, rb);
        this.bandType = bandType;
        this.repeatHeader = false;
        this.alwaysPrintOnSamePage = true;
        this.backgroundColor = '';
        this.alternateBackgroundColor = '';
        this.groupExpression = '';
        this.parentId = initialData.parentId;
        this.columnData = [];

        this.heightVal = 0;
        
        this.setInitialData(initialData);
    }

    setInitialData(initialData) {
        for (let key in initialData) {
            if (initialData.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                this[key] = initialData[key];
            }
        }
        this.heightVal = utils.convertInputToNumber(this.height);
    }

    setup() {
        this.createElement();
        this.updateStyle();
    }

    registerEventHandlers() {
    }

    /**
     * Returns highest id of this component including all its child components.
     * @returns {Number}
     */
    getMaxId() {
        let maxId = this.id;
        for (let col of this.columnData) {
            if (col.getId() > maxId) {
                maxId = col.getId();
            }
        }
        return maxId;
    }

    getContainerId() {
        let parent = this.getParent();
        if (parent !== null) {
            return parent.getContainerId();
        }
        return null;
    }

    setValue(field, value, elSelector, isShown) {
        this[field] = value;
        if (field === 'height') {
            let height = utils.convertInputToNumber(value);
            this[field + 'Val'] = height;
            // set td height to height - 1 because border consumes 1 pixel
            this.getElement().find('td').css({ height: this.rb.toPixel(height - 1) });
            for (let col of this.columnData) {
                col.setValue(field, value, elSelector, isShown);
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
        let fields = ['id', 'height', 'backgroundColor'];
        if (this.bandType === Band.bandType.header) {
            fields.push('repeatHeader');
        } else if (this.bandType === Band.bandType.content) {
            fields.push('alternateBackgroundColor');
            fields.push('groupExpression');
            fields.push('printIf');
            fields.push('alwaysPrintOnSamePage');
        }
        return fields;
    }

    updateDisplayInternal(x, y, width, height) {
    }

    updateStyle() {
        this.el.css('background-color', this.backgroundColor);
    }

    /**
     * Returns allowed sizers when element is selected.
     * @returns {String[]}
     */
    getSizers() {
        return [];
    }

    getHeightTagId() {
        return 'rbro_table_band_element_height';
    }

    getHeight() {
        return this.heightVal;
    }

    isDraggingAllowed() {
        return false;
    }

    isDroppingAllowed() {
        return false;
    }

    createElement() {
        this.el = $(`<tr id="rbro_el_table_band${this.id}" class="rbroTableBandElement"></tr>`);
        $(`#rbro_el_table_${this.bandType}${this.parentId}`).append(this.el);
    }

    remove() {
        super.remove();
        for (let i=0; i < this.columnData.length; i++) {
            this.rb.deleteDataObject(this.columnData[i]);
        }
    }

    getParent() {
        return this.rb.getDataObject(this.parentId);
    }

    createColumns(columns, isUpdate) {
        if (this.panelItem === null) {
            return;
        }

        if (isUpdate) {
            for (let i=0; i < this.columnData.length; i++) {
                this.columnData[i].remove();
                if (i >= columns) {
                    this.rb.deleteDataObject(this.columnData[i]);
                }
            }
        }
        let newColumnData = [];
        for (let i=0; i < columns; i++) {
            let data;
            let dataId;
            if (i < this.columnData.length) {
                data = this.columnData[i];
                dataId = data.id;
                if (!isUpdate) {
                    data.band = this.band;
                    data.columnIndex = i;
                    data.parentId = this.id;
                    data.tableId = this.parentId;
                }
            } else {
                data = { band: this.band, columnIndex: i, parentId: this.id, tableId: this.parentId,
                        width: isUpdate ? 20 : 100, height: this.height };
            }
            if (!dataId) {
                dataId = this.rb.getUniqueId();
            }

            let textElement = new TableTextElement(dataId, data, this.rb);
            newColumnData.push(textElement);
        	this.rb.addDataObject(textElement);
            let panelItemText = new MainPanelItem(DocElement.type.text, this.panelItem, textElement, { showDelete: false }, this.rb);
            textElement.setPanelItem(panelItemText);
            this.panelItem.appendChild(panelItemText);
            textElement.setup(true);
        }
        this.columnData = newColumnData;
        this.getElement().find('td').css({ height: this.rb.toPixel(this.heightVal - 1) });
    }

    show(visible) {
        if (visible) {
            $(`#rbro_el_table_band${this.id}`).removeClass('rbroHidden');
        } else {
            $(`#rbro_el_table_band${this.id}`).addClass('rbroHidden');
        }
    }

    updateColumnWidth(columnIndex, width) {
        if (columnIndex < this.columnData.length) {
            let colData = this.columnData[columnIndex];
            colData.updateColumnWidth(width);
        }
    }

    getColumn(columnIndex) {
        if (columnIndex >= 0 && columnIndex < this.columnData.length) {
            return this.columnData[columnIndex];
        }
        return null;
    }

    getWidth() {
        let width = 0;
        for (let col of this.columnData) {
            width += col.getValue('widthVal');
        }
        return width;
    }

    getColumnWidths() {
        let widths = [];
        for (let col of this.columnData) {
            widths.push(col.getValue('widthVal'));
        }
        return widths;
    }

    addChildren(docElements) {
        for (let column of this.columnData) {
            docElements.push(column);
        }
    }

    toJS() {
        let ret = super.toJS();
        ret['columnData'] = [];
        for (let column of this.columnData) {
            ret['columnData'].push(column.toJS());
        }
        return ret;
    }
}
