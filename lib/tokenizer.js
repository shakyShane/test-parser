var
    ld = '{',
    rd = '}',
    i = 0,
    TEXT = i++,
    LD = i++, // {
    RD = i++, // }
    CLOSE_RD = i++, // }
    BEFORE_TAG_NAME = i++, //after <
    IN_TAG_NAME = i++,
    IN_SELF_CLOSING_TAG = i++,
    BEFORE_CLOSING_TAG_NAME = i++,
    IN_CLOSING_TAG_NAME = i++,
    AFTER_CLOSING_TAG_NAME = i++,

//attributes
    BEFORE_ATTRIBUTE_NAME = i++,
    IN_ATTRIBUTE_NAME = i++,
    AFTER_ATTRIBUTE_NAME = i++,
    BEFORE_ATTRIBUTE_VALUE = i++,
    IN_ATTRIBUTE_VALUE_DQ = i++, // "
    IN_ATTRIBUTE_VALUE_SQ = i++, // '
    IN_ATTRIBUTE_VALUE_NQ = i++
    ;
function whitespace(c) {
    return c === " " || c === "\n" || c === "\t" || c === "\f" || c === "\r";
}
function newline (c) {
    return c === '\n' || c === '\r';
}
function Tokenizer(options, cbs) {
    this._state = TEXT;
    this._buffer = "";
    this._sectionStart = 0;
    this._index = 0;
    this._bufferOffset = 0; //chars removed from _buffer
    this._baseState = TEXT;
    //this._special = SPECIAL_NONE;
    this._cbs = cbs;
    this._running = true;
    this._ended = false;
}

Tokenizer.prototype.write = function (chunk) {
    if (this._ended) this._cbs.onerror(Error(".write() after done!"));

    this._buffer += chunk;
    this._parse();
};

Tokenizer.prototype._parse = function () {
    while (this._index < this._buffer.length && this._running) {
        var c = this._buffer.charAt(this._index);
        if (c === '\n' || c === '\r') {
            //console.log('newline');
        }
        if (this._state === TEXT) {
            this._stateText(c);
        } else if (this._state === LD) {
            this._stateBeforeLD(c);
        } else if (this._state === RD) {
            this._stateBeforeRD(c);
        }else if (this._state === CLOSE_RD) {
            this._stateAfterCloseingRD(c);
        } else if (this._state === BEFORE_TAG_NAME) {
            this._stateBeforeTagName(c);
        } else if (this._state === IN_TAG_NAME) {
            this._stateInTagName(c);
        } else if (this._state === BEFORE_CLOSING_TAG_NAME) {
            this._stateBeforeCloseingTagName(c);
        } else if (this._state === IN_CLOSING_TAG_NAME) {
            this._stateInCloseingTagName(c);
        } else if (this._state === AFTER_CLOSING_TAG_NAME) {
            this._stateAfterCloseingTagName(c);
        } else if (this._state === IN_SELF_CLOSING_TAG) {
            this._stateInSelfClosingTag(c);
        }
        /*
         *	attributes
         */
        else if (this._state === BEFORE_ATTRIBUTE_NAME) {
            this._stateBeforeAttributeName(c);
        } else if (this._state === IN_ATTRIBUTE_NAME) {
            this._stateInAttributeName(c);
        } else if (this._state === AFTER_ATTRIBUTE_NAME) {
            this._stateAfterAttributeName(c);
        } else if (this._state === BEFORE_ATTRIBUTE_VALUE) {
            this._stateBeforeAttributeValue(c);
        } else if (this._state === IN_ATTRIBUTE_VALUE_DQ) {
            this._stateInAttributeValueDoubleQuotes(c);
        } else if (this._state === IN_ATTRIBUTE_VALUE_SQ) {
            this._stateInAttributeValueSingleQuotes(c);
        } else if (this._state === IN_ATTRIBUTE_VALUE_NQ) {
            this._stateInAttributeValueNoQuotes(c);
        }
        this._index++;
    }
    this._cleanup();
};
Tokenizer.prototype._cleanup = function () {
    if (this._sectionStart < 0) {
        this._buffer = "";
        this._index = 0;
        this._bufferOffset += this._index;
    } else if (this._running) {
        if (this._state === TEXT) {
            if (this._sectionStart !== this._index) {
                this._cbs.ontext(this._buffer.substr(this._sectionStart), this._loc());
            }
            this._buffer = "";
            this._index = 0;
            this._bufferOffset += this._index;
        } else if (this._sectionStart === this._index) {
            //the section just started
            this._buffer = "";
            this._index = 0;
            this._bufferOffset += this._index;
        } else {
            //remove everything unnecessary
            this._buffer = this._buffer.substr(this._sectionStart);
            this._index -= this._sectionStart;
            this._bufferOffset += this._sectionStart;
        }

        this._sectionStart = 0;
    }
};

Tokenizer.prototype._getSection = function () {
    return this._buffer.substring(this._sectionStart, this._index);
};

Tokenizer.prototype._stateText = function (c) {
    if (c === ld) {
        if (this._index > this._sectionStart) {
            this._cbs.ontext(this._getSection(), this._loc());
        }
        this._state = LD;
        this._sectionStart = this._index + 1;
    }
};

Tokenizer.prototype._stateBeforeLD = function (c) {
    if (c === ld) {
        this._state = BEFORE_TAG_NAME;
        this._sectionStart = this._index + 1;
    }
};

Tokenizer.prototype._stateBeforeRD = function (c) {
    if (c === rd) {
        this._state = TEXT;
        this._sectionStart = this._index + 1;
    }
};

Tokenizer.prototype._stateBeforeTagName = function (c) {
    if (c === "/") {
        this._state = BEFORE_CLOSING_TAG_NAME;
    } else if (c === rd || whitespace(c)) {
        this._state = TEXT;
    } else if (c === ld) {
        this._cbs.ontext(this._getSection(), this._loc());
        this._sectionStart = this._index;
    } else {
        this._state = IN_TAG_NAME;
        this._sectionStart = this._index;
    }
};

Tokenizer.prototype._stateInTagName = function (c) {
    if (c === "/" || c === rd || whitespace(c)) {
        this._emitToken("onopentagname");
        this._state = BEFORE_ATTRIBUTE_NAME;
        this._index--;
    }
};

Tokenizer.prototype._stateBeforeCloseingTagName = function (c) {
    if (whitespace(c));
    else if (c === rd) {
        this._state = TEXT;
    } else {
        this._state = IN_CLOSING_TAG_NAME;
        this._sectionStart = this._index;
    }
};

Tokenizer.prototype._stateInCloseingTagName = function (c) {
    if (c === rd) {
        this._state = CLOSE_RD;
        this._index--;
    }
};

Tokenizer.prototype._stateAfterCloseingRD = function (c) {
    if (c === rd) {
        this._emitToken("onclosetag");
        this._state = AFTER_CLOSING_TAG_NAME;
    }
};

Tokenizer.prototype._stateAfterCloseingTagName = function (c) {
    //skip everything until rd
    if (c === rd) {
        this._state = TEXT;
        this._sectionStart = this._index + 1;
    }
};
Tokenizer.prototype._stateBeforeAttributeName = function (c) {
    if (c === rd) {
        this._state = RD;
        this._cbs.onopentagend(this._loc());
    } else if (c === "/") {
        this._state = IN_SELF_CLOSING_TAG;
    } else if (!whitespace(c)) {
        this._state = IN_ATTRIBUTE_NAME;
        this._sectionStart = this._index;
    }
};

Tokenizer.prototype._stateInSelfClosingTag = function (c) {
    if (c === rd) {
        this._cbs.onselfclosingtag();
        this._state = TEXT;
        this._sectionStart = this._index + 1;
    } else if (!whitespace(c)) {
        this._state = BEFORE_ATTRIBUTE_NAME;
        this._index--;
    }
};

Tokenizer.prototype._stateInAttributeName = function (c) {
    if (c === "=" || c === "/" || c === rd || whitespace(c)) {
        this._cbs.onattribname(this._getSection());
        this._sectionStart = -1;
        this._state = AFTER_ATTRIBUTE_NAME;
        this._index--;
    }
};

Tokenizer.prototype._stateAfterAttributeName = function (c) {
    if (c === "=") {
        this._state = BEFORE_ATTRIBUTE_VALUE;
    } else if (c === "/" || c === rd) {
        this._cbs.onattribend();
        this._state = BEFORE_ATTRIBUTE_NAME;
        this._index--;
    } else if (!whitespace(c)) {
        this._cbs.onattribend();
        this._state = IN_ATTRIBUTE_NAME;
        this._sectionStart = this._index;
    }
};

Tokenizer.prototype._stateBeforeAttributeValue = function (c) {
    if (c === "\"") {
        this._state = IN_ATTRIBUTE_VALUE_DQ;
        this._sectionStart = this._index + 1;
    } else if (c === "'") {
        this._state = IN_ATTRIBUTE_VALUE_SQ;
        this._sectionStart = this._index + 1;
    } else if (!whitespace(c)) {
        this._state = IN_ATTRIBUTE_VALUE_NQ;
        this._sectionStart = this._index;
        this._index--; //reconsume token
    }
};

Tokenizer.prototype._stateInAttributeValueDoubleQuotes = function (c) {
    if (c === "\"") {
        this._emitToken("onattribdata");
        this._cbs.onattribend();
        this._state = BEFORE_ATTRIBUTE_NAME;
    }
};

Tokenizer.prototype._stateInAttributeValueSingleQuotes = function (c) {
    if (c === "'") {
        this._emitToken("onattribdata");
        this._cbs.onattribend();
        this._state = BEFORE_ATTRIBUTE_NAME;
    }
};

Tokenizer.prototype._stateInAttributeValueNoQuotes = function (c) {
    if (whitespace(c) || c === rd) {
        this._emitToken("onattribdata");
        this._cbs.onattribend();
        this._state = BEFORE_ATTRIBUTE_NAME;
        this._index--;
    }
};

Tokenizer.prototype._emitToken = function (name) {
    //console.log('running', name);
    this._cbs[name](this._getSection(), this._loc());
    this._sectionStart = -1;
};

Tokenizer.prototype._loc = function () {

    return {
        startIndex: this._sectionStart,
        endIndex: this._index
    }
};

module.exports.parse = function (string, cbs) {
    var t = new Tokenizer({}, cbs);
    t.write(string);
    return t;
};
