import DocElement from './DocElement';
import SetValueCmd from '../commands/SetValueCmd';
import Style from '../data/Style';
import * as utils from '../utils';

/**
 * Image doc element. Supported formats are png and jpg.
 * @class
 */
export default class ImageElement extends DocElement {
    constructor(id, initialData, rb) {
        super(rb.getLabel('docElementImage'), id, 80, 80, rb);
        this.source = '';
        this.image = '';
        this.imageWidth = 0;
        this.imageHeight = 0;
        this.imageRatio = 0;
        this.imageFilename = '';
        this.elImg = null;
        this.horizontalAlignment = Style.alignment.left;
        this.verticalAlignment = Style.alignment.top;
        this.backgroundColor = '';
        this.link = '';
        this.spreadsheet_hide = false;
        this.spreadsheet_column = '';
        this.spreadsheet_addEmptyRow = false;
        this.setInitialData(initialData);
    }

    setup(openPanelItem) {
        super.setup(openPanelItem);
        this.createElement();
        // setImage must be called after createElement so load event handler of image element is triggered
        this.setImage();
        this.updateDisplay();
        this.updateStyle();
        this.updateName();
    }

    setValue(field, value) {
        super.setValue(field, value);
        if (field === 'source' || field === 'imageFilename') {
            this.updateName();
        }
        if (field === 'source' || field === 'image') {
            this.setImage();
        }
    }

    /**
     * Returns all fields of this object that can be modified in the properties panel.
     * @returns {String[]}
     */
    getProperties() {
        return ['x', 'y', 'width', 'height', 'source', 'image', 'imageFilename',
            'horizontalAlignment', 'verticalAlignment', 'backgroundColor',
            'printIf', 'removeEmptyElement', 'link',
            'spreadsheet_hide', 'spreadsheet_column', 'spreadsheet_addEmptyRow'];
    }

    getElementType() {
        return DocElement.type.image;
    }

    updateDisplayInternal(x, y, width, height) {
        if (this.el !== null) {
            let props = { left: this.rb.toPixel(x), top: this.rb.toPixel(y),
                width: this.rb.toPixel(width), height: this.rb.toPixel(height) };
            this.el.css(props);

            let imgWidth = 0;
            let imgHeight = 0;
            if (this.imageRatio !== 0) {
                imgWidth = (this.imageWidth < width) ? this.imageWidth : width;
                imgHeight = (this.imageHeight < height) ? this.imageHeight : height;
                if (imgWidth !== this.imageWidth || imgHeight !== this.imageHeight) {
                    let scaledWidth = Math.floor(imgHeight * this.imageRatio);
                    if (scaledWidth < width) {
                        imgWidth = scaledWidth;
                    } else {
                        imgHeight = Math.floor(imgWidth / this.imageRatio);
                    }
                }
            }
            this.elImg.css({ width: this.rb.toPixel(imgWidth), height: this.rb.toPixel(imgHeight) });
        }
    }

    updateStyle() {
        let styleProperties = {};
        let horizontalAlignment = this.getValue('horizontalAlignment');
        let verticalAlignment = this.getValue('verticalAlignment');
        let alignClass = 'rbroDocElementAlign' + horizontalAlignment.charAt(0).toUpperCase() + horizontalAlignment.slice(1);
        let valignClass = 'rbroDocElementVAlign' + verticalAlignment.charAt(0).toUpperCase() + verticalAlignment.slice(1);
        styleProperties['text-align'] = horizontalAlignment;
        styleProperties['vertical-align'] = verticalAlignment;
        styleProperties['background-color'] = this.getValue('backgroundColor');
        $(`#rbro_el_content${this.id}`).css(styleProperties);
        $(`#rbro_el_content${this.id}`).removeClass().addClass('rbroContentContainerHelper').addClass(alignClass).addClass(valignClass);
    }

    createElement() {
        this.el = $(`<div id="rbro_el${this.id}" class="rbroDocElement rbroImageElement"></div>`);
        this.elImg = $('<img src="">')
            .on('load', event => {
                // get image width and height in load event, because width/height are not
                // directly available in some browsers after setting src
                this.imageWidth = this.elImg.get(0).naturalWidth;
                this.imageHeight = this.elImg.get(0).naturalHeight;
                if (this.imageHeight !== 0) {
                    this.imageRatio = this.imageWidth / this.imageHeight;
                } else {
                    this.imageRatio = 0;
                }
                this.updateDisplay();
            });
        this.el
            .append($(`<div id="rbro_el_content${this.id}" class="rbroContentContainerHelper"></div>`)
                .append(this.elImg)
            );
        this.appendToContainer();
        super.registerEventHandlers();
    }

    remove() {
        this.elImg = null;
        super.remove();
    }

    setImage() {
        this.elImg.attr('src', '');
        if (this.source.startsWith('https://') || this.source.startsWith('http://')) {
            // image specified by url
            this.elImg.attr('src', this.source);
        } else if (this.image !== '') {
            // image base64 encoded
            this.elImg.attr('src', this.image);
        } else {
            // no image preview
            this.imageWidth = 0;
            this.imageHeight = 0;
            this.imageRatio = 0;
            this.updateDisplay();
        }
    }

    updateName() {
        if (this.getValue('imageFilename').trim() !== '') {
            this.name = this.getValue('imageFilename')
        } else if (this.getValue('source').trim() !== '') {
            this.name = this.getValue('source');
        } else {
            this.name = this.rb.getLabel('docElementImage');
        }
        $(`#rbro_menu_item_name${this.id}`).text(this.name);
        $(`#rbro_menu_item_name${this.id}`).attr('title', this.name);
    }

    /**
     * Adds SetValue commands to command group parameter in case the specified parameter is used in any of
     * the object fields.
     * @param {Parameter} parameter - parameter which will be renamed.
     * @param {String} newParameterName - new name of the parameter.
     * @param {CommandGroupCmd} cmdGroup - possible SetValue commands will be added to this command group.
     */
    addCommandsForChangedParameterName(parameter, newParameterName, cmdGroup) {
        this.addCommandForChangedParameterName(parameter, newParameterName, 'source', cmdGroup);
        this.addCommandForChangedParameterName(parameter, newParameterName, 'printIf', cmdGroup);
    }

    /**
     * Returns class name.
     * This can be useful for introspection when the class names are mangled
     * due to the webpack uglification process.
     * @returns {string}
     */
    getClassName() {
        return 'ImageElement';
    }
}
