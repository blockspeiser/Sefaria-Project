import Component from "react-class";
import $ from "./sefaria/sefariaJquery";
import ReactDOM from "react-dom";
import Sefaria from "./sefaria/sefaria";
import {
  InterfaceText, ProfilePic, SaveButton, SheetAuthorStatement,
  SheetMetaDataBox, SheetMetaDataBoxSegment
} from "./Misc";
import React, {useEffect, useState} from "react";
import classNames from "classnames";
import {AddToSourceSheetBox} from "./AddToSourceSheet";
import {DropdownMenu, DropdownMenuItem, DropdownMenuItemWithIcon, DropdownMenuSeparator} from "./common/DropdownMenu";
import {SignUpModalKind} from "./sefaria/signupModalContent";
import {ShareBox, ToolsButton} from "./ConnectionsPanel";
import Modal from "./shared/Modal.jsx";

class SheetContent extends Component {
  componentDidMount() {
      this.$container = $(ReactDOM.findDOMNode(this).parentNode);
      this._isMounted = true;
      var node = ReactDOM.findDOMNode(this).parentNode;
      node.addEventListener("scroll", this.handleScroll);
      this.windowMiddle = $(window).outerHeight() / 2;
      this.highlightThreshhold = this.props.multiPanel ? 200 : 70; // distance from the top of screen that we want highlighted segments to appear below.
      this.debouncedAdjustHighlightedAndVisible = Sefaria.util.debounce(this.adjustHighlightedAndVisible, 100);
      this.scrollToHighlighted();
  }
  componentWillUnmount() {
    this._isMounted = false;
    var node = ReactDOM.findDOMNode(this).parentNode;
    node.removeEventListener("scroll", this.handleScroll);
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.highlightedNode !== this.props.highlightedNode &&
      this.props.scrollToHighlighted) {
      this.scrollToHighlighted();
    }
  }
  handleScroll(event) {
    if (this.justScrolled) {
      this.justScrolled = false;
      return;
    }
    this.debouncedAdjustHighlightedAndVisible();
  }
  handleTextSelection() {
    const selectedWords = Sefaria.util.getNormalizedSelectionString(); //this gets around the above issue
    if (selectedWords !== this.props.selectedWords) {
      //console.log("setting selecting words")
      this.props.setSelectedWords(selectedWords);
    }
  }
  adjustHighlightedAndVisible() {
    //console.log("adjustHighlightedAndVisible");
    // Adjust which ref is current consider visible for header and URL,
    // and while the TextList is open, update which segment should be highlighted.
    // Keeping the highlightedRefs value in the panel ensures it will return
    // to the right location after closing other panels.
    if (!this._isMounted) { return; }

    // When using tab to navigate (i.e. a11y) set ref to currently focused ref
    var $segment = null;
    if ($("body").hasClass("user-is-tabbing") && $(".segment:focus").length > 0) {
      $segment = $(".segment:focus").eq(0);
    } else {
      var $container = this.$container;
      var topThreshhold = this.highlightThreshhold;
      $container.find("section .segment").each(function(i, segment) {
        var top = $(segment).offset().top - $container.offset().top;
        var bottom = $(segment).outerHeight() + top;
        if (bottom > this.windowMiddle || top >= topThreshhold) {
          $segment = $(segment);
          return false;
        }
      }.bind(this));
    }
    if (!$segment) { return; }

    // don't move around highlighted segment when scrolling a single panel,
    const node = parseInt($segment.attr("data-node"));
    if (!(this.props.highlightedNode === node)) {
      $segment.click();
    }
  }
  scrollToHighlighted() {
    if (!this._isMounted) { return; }
    var $container   = this.$container;
    var $readerPanel = $container.closest(".readerPanel");
    var $highlighted = $container.find(".segment.highlight").first();
    if ($highlighted.length) {
      this.scrolledToHighlight = true;
      this.justScrolled = true;
      var offset = this.highlightThreshhold;
      var top = $highlighted.position().top - offset;

      $container[0].scrollTop = top;
      if ($readerPanel.attr("id") === $(".readerPanel:last").attr("id")) {
        $highlighted.focus();
      }
    }
  }
  renderSheetSource = (source, i) => {
    const { highlightedNode, cleanHTML, sheetSourceClick, sheetNumbered, highlightedRefsInSheet } = this.props;
    const highlightedRef = highlightedRefsInSheet ? Sefaria.normRefList(highlightedRefsInSheet) : null;
    const highlighted = highlightedNode
      ? highlightedNode === source.node
      : highlightedRef ? Sefaria.refContains(source.ref, highlightedRef) : false;

    return (
      <SheetSource
        key={i}
        source={source}
        sourceNum={i + 1}
        cleanHTML={cleanHTML}
        sheetSourceClick={() => sheetSourceClick(source)}
        highlighted={highlighted}
        sheetNumbered={sheetNumbered}
      />
    );
  }

  renderSheetComment = (source, i) => {
    const { cleanHTML, sheetSourceClick, highlightedNode, sheetNumbered } = this.props;
    return (
      <SheetComment
        key={i}
        sourceNum={i + 1}
        source={source}
        cleanHTML={cleanHTML}
        sheetSourceClick={() => sheetSourceClick(source)}
        highlightedNode={highlightedNode}
        sheetNumbered={sheetNumbered}
      />
    );
  }

  renderSheetHeader = (source, i) => {
    const { sheetSourceClick, highlightedNode, sheetNumbered } = this.props;
    return (
      <SheetHeader
        key={i}
        sourceNum={i + 1}
        source={source}
        sheetSourceClick={() => sheetSourceClick(source)}
        highlightedNode={highlightedNode}
        sheetNumbered={sheetNumbered}
      />
    );
  }

  renderSheetOutsideText = (source, i) => {
    const { cleanHTML, sheetSourceClick, highlightedNode, sheetNumbered } = this.props;
    return (
      <SheetOutsideText
        key={i}
        sourceNum={i + 1}
        source={source}
        cleanHTML={cleanHTML}
        sheetSourceClick={() => sheetSourceClick(source)}
        highlightedNode={highlightedNode}
        sheetNumbered={sheetNumbered}
      />
    );
  }

  renderSheetOutsideBiText = (source, i) => {
    const { cleanHTML, sheetSourceClick, highlightedNode, sheetNumbered } = this.props;
    return (
      <SheetOutsideBiText
        key={i}
        sourceNum={i + 1}
        source={source}
        clean
                HTML={cleanHTML}
        sheetSourceClick={() => sheetSourceClick(source)}
        highlightedNode={highlightedNode}
        sheetNumbered={sheetNumbered}
      />
    );
  }

  renderSheetMedia = (source, i) => {
    const { cleanHTML, sheetSourceClick, highlightedNode, sheetNumbered, hideImages } = this.props;
    return (
      <SheetMedia
        key={i}
        sourceNum={i + 1}
        cleanHTML={cleanHTML}
        source={source}
        sheetSourceClick={() => sheetSourceClick(source)}
        highlightedNode={highlightedNode}
        sheetNumbered={sheetNumbered}
        hideImages={hideImages}
      />
    );
  }

  getSources = () => {
    const { sources } = this.props;

    if (!sources.length) return null;

    return sources.map((source, i) => {
      let sourceComponent;
      if ("ref" in source) {
        sourceComponent = this.renderSheetSource(source, i);
      } else if ("comment" in source) {
        sourceComponent = this.renderSheetComment(source, i);
      } else if ("outsideText" in source) {
        sourceComponent = source.outsideText.startsWith("<h1>")
                              ? this.renderSheetHeader(source, i)
                              : this.renderSheetOutsideText(source, i);
      } else if ("outsideBiText" in source) {
        sourceComponent = this.renderSheetOutsideBiText(source, i);
      } else if ("media" in source) {
        sourceComponent = this.renderSheetMedia(source, i);
      }
      if (!sourceComponent) { return null; }
      return <>{sourceComponent}<AddToSheetButton nodeRef={this.props.nodeRef}
                                                  highlightedRefsInSheet={this.props.highlightedRefsInSheet}/></>;
    });
  }
  render() {
    const sources = this.getSources();
    const sheetContentOptions = <SheetContentOptions toggleSignUpModal={this.props.toggleSignUpModal}
                                                             sheetID={this.props.sheetID}
                                                             historyObject={this.props.historyObject}/>;
    return (
      <div className="sheetContent">
        <div className="text">
          <SheetContentMetaDataBox authorStatement={this.props.authorStatement} authorUrl={this.props.authorUrl}
                                   authorImage={this.props.authorImage} title={this.props.title}
                                   summary={this.props.summary}
                                   sheetContentOptions={sheetContentOptions}/>
          <div className="textInner" onMouseUp={this.handleTextSelection} onClick={this.props.handleClick}>
            {sources}
          </div>
        </div>

        <div id="printFooter" style={{display:"none"}}>
          <span className="int-en">Created with <img src="/static/img/logo.svg" /></span>
          <span className="int-he">{Sefaria._("Created with")} <img src="/static/img/logo.svg" /></span>
        </div>
      </div>
    )
  }
}

const AddToSheetButton = ({nodeRef, highlightedRefsInSheet}) => {
  const handleClick = () => {
    return <Modal><AddToSourceSheetBox/></Modal>
  }
  return <div className="button" onClick={handleClick}>Add to Sheet</div>;
}

const SheetContentOptions = ({historyObject, toggleSignUpModal, sheetID}) => {
  const [isSharing, setSharing] = useState(false); // Share Modal open or closed
  const [isAdding, setAdding] = useState(false);  // Add to Collection Modal open or closed
  if (isSharing) {
    return <ShareModal sheetID={sheetID} isOpen={isSharing} close={() => setSharing(false)}/>;
  }
  else if (isAdding) {
    return <AddToCollectionsModal isOpen={isAdding} close={() => setAdding(false)}/>;
  }
  return (
    <DropdownMenu toggle={"..."}>
      <DropdownMenuItem>
        <SaveButton
            historyObject={historyObject}
            tooltip={true}
            toggleSignUpModal={toggleSignUpModal}
            shouldDisplayText={true}
        />
      </DropdownMenuItem>
      <DropdownMenuItem>
        <GoogleDocExportButton sheetID={sheetID} toggleSignUpModal={toggleSignUpModal}/>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <CopyButton toggleSignUpModal={toggleSignUpModal} sheetID={sheetID}/>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <DropdownMenuItemWithIcon icon={"/static/img/share.svg"}
                                  textEn={'Share'}
                                  textHe={'שיתוף'}
                                  descEn={""}
                                  descHe={""}
                                  onClick={() => setSharing(true)}/>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <DropdownMenuItemWithIcon icon={"/static/icons/collection.svg"}
                                  textEn={'Add to Collection'}
                                  textHe={'צירוף לאסופה'}
                                  descEn={""}
                                  descHe={""}
                                  onClick={() => setAdding(true)} />
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
const ShareModal = ({sheetID, isOpen, close}) => {
  return <Modal isOpen={true} close={close}>
          <ShareBox
              sheetID={sheetID}
              url={window.location.href}
          />
        </Modal>;
}
const AddToCollectionsModal = ({isOpen, close}) => {
  return <Modal isOpen={true} close={close}><SheetContentCollectionsEditor/></Modal>;

}

const CopyButton = ({toggleSignUpModal, sheetID}) => {
  const copyState = {
    copy: { en: "Copy", he: "העתקה" },
    copying: { en: "Copying...", he: "מעתיק..."},
    copied: { he: "צפייה בדף המקורות", en: "View Copy"},
    error: { en: "Sorry, there was an error.", he: "סליחה, ארעה שגיאה" }
  }
  const [copyText, setCopyText] = useState(copyState.copy);
  const [copiedSheetId, setCopiedSheetId] = useState(0);
  const sheet = Sefaria.sheets.loadSheetByID(sheetID);
  const filterAndSaveCopiedSheetData = (data) => {
    let newSheet = Sefaria.util.clone(data);
    newSheet.status = "unlisted";
    newSheet.title = newSheet.title + " (Copy)";

    if (Sefaria._uid !== newSheet.owner) {
      newSheet.via = newSheet.id;
      newSheet.viaOwner = newSheet.owner;
      newSheet.owner = Sefaria._uid
    }
    delete newSheet.id;
    delete newSheet.ownerName;
    delete newSheet.views;
    delete newSheet.dateCreated;
    delete newSheet.dateModified;
    delete newSheet.displayedCollection;
    delete newSheet.collectionName;
    delete newSheet.collectionImage;
    delete newSheet.likes;
    delete newSheet.promptedToPublish;
    delete newSheet._id;

    const postJSON = JSON.stringify(newSheet);
    $.post("/api/sheets/", { "json": postJSON }, (data) => {
      if (data.id) {
        setCopiedSheetId(data.id);
        setCopyText(copyState.copied);
      } else if ("error" in data) {
        setCopyText(copyState.error);
        console.log(data.error);
      }
    })
  }

  const copySheet = () => {
    if (!Sefaria._uid) {
      toggleSignUpModal(SignUpModalKind.AddToSheet);
    } else if (copyText.en === copyState.copy.en) {
      setCopyText(copyState.copying);
      filterAndSaveCopiedSheetData(sheet);
    } else if (copyText.en === copyState.copied.en) {
      window.location.href = `/sheets/${copiedSheetId}`
      // TODO: open copied sheet
    }
  }
  return <ToolsButton en={copyText.en} he={copyText.he} image="copy.png" greyColor={!!copyText.secondaryEn || copyText.greyColor} onClick={() => copySheet()} />;
}
const GoogleDocExportButton = ({ toggleSignUpModal, sheetID }) => {
  const googleDriveState = {
    export: { en: "Export to Google Docs", he: "ייצוא לגוגל דוקס" },
    exporting: {en: "Exporting to Google Docs...", he: "מייצא לגוגל דוקס...", greyColor: true},
    exportComplete: { en: "Export Complete", he: "ייצוא הסתיים", secondaryEn: "Open in Google", secondaryHe: "לפתיחה בגוגל דוקס", greyColor: true}
  }
  const urlHashObject = Sefaria.util.parseHash(Sefaria.util.parseUrl(window.location).hash).afterLoading;
  const [googleDriveText, setGoogleDriveText] = urlHashObject === "exportToDrive" ? useState(googleDriveState.exporting) : useState(googleDriveState.export);
  const [googleDriveLink, setGoogleDriveLink] = useState("");
  const sheet = Sefaria.sheets.loadSheetByID(sheetID);

  useEffect(() => {
    if (googleDriveText.en === googleDriveState.exporting.en) {
      history.replaceState("", document.title, window.location.pathname + window.location.search); // remove exportToDrive hash once it's used to trigger export
      $.ajax({
        type: "POST",
        url: "/api/sheets/" + sheet.id + "/export_to_drive",
        success: function (data) {
          if ("error" in data) {
            console.log(data.error.message);
            // Export Failed
          } else {
            // Export succeeded
            setGoogleDriveLink(data.webViewLink);
            setGoogleDriveText(googleDriveState.exportComplete)
          }
        },
        statusCode: {
          401: function () {
            window.location.href = "/gauth?next=" + encodeURIComponent(window.location.protocol + '//' + window.location.host + window.location.pathname + window.location.search + "#afterLoading=exportToDrive");
          }
        }
      });
    }
  }, [googleDriveText])
  const googleDriveExport = () => {
    // $("#overlay").show();
    // sjs.alert.message('<span class="int-en">Syncing with Google Docs...</span><span class="int-he">מייצא לגוגל דרייב...</span>');
    if (!Sefaria._uid) {
      toggleSignUpModal();
    }
    else if (googleDriveText.en === googleDriveState.exportComplete.en) {
      Sefaria.util.openInNewTab(googleDriveLink);
    } else {
      Sefaria.track.sheets("Export to Google Docs");
      setGoogleDriveText(googleDriveState.exporting);
    }
  }
  return <div>
            <ToolsButton en={googleDriveText.en} he={googleDriveText.he} greyColor={!!googleDriveText.secondaryEn || googleDriveText.greyColor} secondaryEn={googleDriveText.secondaryEn} secondaryHe={googleDriveText.secondaryHe} image="googledrive.svg" onClick={() => googleDriveExport()} />
          </div>;
}
const SheetContentMetaDataBox = ({title, summary, authorUrl, authorStatement, authorImage, sheetContentOptions}) => {
  return <SheetMetaDataBox>
    <div className="sidebarLayout">
      <SheetMetaDataBoxSegment text={title} className="title"/>
      {sheetContentOptions}
    </div>
    {summary && <SheetMetaDataBoxSegment text={summary} className="summary"/>}
    <SheetAuthorStatement
        authorUrl={authorUrl}
        authorStatement={authorStatement}>
      <ProfilePic
          url={authorImage}
          len={30}
          name={authorStatement}
          outerStyle={{
            width: "30px",
            height: "30px",
            display: "inline-block",
            verticalAlign: "middle",
            marginInlineEnd: "10px"
          }}
      />
      <a href={authorUrl} className="sheetAuthorName">
        <InterfaceText>{authorStatement}</InterfaceText>
      </a>
    </SheetAuthorStatement>
  </SheetMetaDataBox>
}
class SheetSource extends Component {
  render() {

    const sectionClasses= classNames(
      "SheetSource",
      this.props.highlighted ? "highlight" : null,
      this.props.source.options ? this.props.source.options.indented : null,
    );

    const containerClasses = classNames(
      "sheetItem",
      "segment",
      this.props.highlighted ? "highlight" : null,
      (this.props.source.text && this.props.source.text.en && this.props.source.text.en.stripHtml() === "...") || (this.props.source.text && (!this.props.source.text.en || !this.props.source.text.en.stripHtml())) ? "heOnly" : null,
      (this.props.source.text && this.props.source.text.he && this.props.source.text.he.stripHtml() === "...") || (this.props.source.text && (!this.props.source.text.he || !this.props.source.text.he.stripHtml())) ? "enOnly" : null,
      this.props.source.options && this.props.source.options.refDisplayPosition ? "ref-display-"+ this.props.source.options.refDisplayPosition : null
    );

    return (
      <section className={sectionClasses} style={{"borderColor": Sefaria.palette.refColor(this.props.source.ref)}}>
        <div className={containerClasses}
          onClick={this.props.sheetSourceClick}
          data-node={this.props.source.node}
          aria-label={"Click to see connections to this source"}
          tabIndex="0"
          onKeyPress={function(e) {
            e.charCode === 13 ? this.props.sheetSourceClick(e):null}.bind(this)
          } >
          {this.props.source.title ?
          <div className="customSourceTitle" role="heading" aria-level="3">
            <div className="titleBox">{this.props.source.title.stripHtml()}</div>
          </div> : null}

          {this.props.source.text && this.props.source.text.he && this.props.source.text.he !== "" ?
          <div className="he">
            {this.props.source.options && this.props.source.options.sourcePrefix && this.props.source.options.sourcePrefix != "" ? <sup className="sourcePrefix">{this.props.source.options.sourcePrefix}</sup> : null }
            <div className="ref">
              {this.props.source.options && this.props.source.options.PrependRefWithHe ? this.props.source.options.PrependRefWithHe : null}
              <a href={"/" + Sefaria.normRef(this.props.source.ref)}>{this.props.source.heRef}</a>
            </div>
            <div className="sourceContentText" dangerouslySetInnerHTML={ {__html: (Sefaria.util.cleanHTML(this.props.source.text.he))} }></div>
          </div> : null }

          {this.props.source.text && this.props.source.text.en && this.props.source.text.en !== "" ?
          <div className="en">
            {this.props.source.options && this.props.source.options.sourcePrefix && this.props.source.options.sourcePrefix != "" ? <sup className="sourcePrefix">{this.props.source.options.sourcePrefix}</sup> : null }
            <div className="ref">
              {this.props.source.options && this.props.source.options.PrependRefWithEn ? this.props.source.options.PrependRefWithEn : null}
              <a href={"/" + Sefaria.normRef(this.props.source.ref)}>{this.props.source.ref}</a>
            </div>
            <div className="sourceContentText" dangerouslySetInnerHTML={ {__html: (Sefaria.util.cleanHTML(this.props.source.text.en))} }></div>
          </div> : null }

          <div className="clearFix"></div>

          {this.props.source.addedBy ?
          <div className="addedBy">
            <small><em>{Sefaria._("Added by")}: <span dangerouslySetInnerHTML={ {__html: Sefaria.util.cleanHTML(this.props.source.userLink)} }></span></em></small>
          </div>
          : null }

        </div>
      </section>
    );
  }
}


class SheetComment extends Component {
  render() {
    const lang = Sefaria.hebrew.isHebrew(this.props.source.comment.stripHtml().replace(/\s+/g, ' ')) ? "he" : "en";
    const containerClasses = classNames(
      "sheetItem",
      "segment",
      lang == "he" ? "heOnly" : "enOnly",
      this.props.highlightedNode == this.props.source.node ? "highlight" : null,
      this.props.source.options ? this.props.source.options.indented : null
    );

    return (
      <section className="SheetComment">
        <div className={containerClasses} data-node={this.props.source.node} onClick={this.props.sheetSourceClick} aria-label={"Click to see " + this.props.linkCount +  " connections to this source"} tabIndex="0" onKeyPress={function(e) {e.charCode == 13 ? this.props.sheetSourceClick(e):null}.bind(this)} >

          <div className={lang}>
              <div
                className="sourceContentText"
                dangerouslySetInnerHTML={{__html: Sefaria.util.cleanHTML(this.props.source.comment)}}></div>
          </div>

          <div className="clearFix"></div>
          {this.props.source.addedBy ?
          <div className="addedBy">
            <small><em>
              {Sefaria._("Added by")}: <span dangerouslySetInnerHTML={ {__html: Sefaria.util.cleanHTML(this.props.source.userLink)} }></span>
            </em></small>
          </div>
          : null }

        </div>
      </section>
    );
  }
}

class SheetHeader extends Component {
  render() {
    const lang = Sefaria.hebrew.isHebrew(this.props.source.outsideText.stripHtml().replace(/\s+/g, ' ')) ? "he" : "en";
    const containerClasses = classNames("sheetItem",
        "segment",
        lang == "he" ? "heOnly" : "enOnly",
        this.props.highlightedNode === this.props.source.node ? "highlight" : null,
        this.props.source.options ? this.props.source.options.indented : null
    );

    return (
        <div className={containerClasses} data-node={this.props.source.node} onClick={this.props.sheetSourceClick} aria-label={"Click to see " + this.props.linkCount +  " connections to this source"} tabIndex="0" onKeyPress={function(e) {e.charCode == 13 ? this.props.sheetSourceClick(e):null}.bind(this)} >
          <div className={lang}>
              <div className="sourceContentText"><h1><span>{this.props.source.outsideText.stripHtml()}</span></h1></div>
          </div>
        </div>
    )


  }

}


class SheetOutsideText extends Component {
  shouldPassClick(e) {
    const target = e.target.closest('a')
    if (target) {
      return
    }
    else{
      this.props.sheetSourceClick(this.props.source)
    }
  }

  render() {
    const lang = Sefaria.hebrew.isHebrew(this.props.source.outsideText.stripHtml().replace(/\s+/g, ' ')) ? "he" : "en";
    const containerClasses = classNames("sheetItem",
        "segment",
        lang == "he" ? "heOnly" : "enOnly",
        this.props.highlightedNode === this.props.source.node ? "highlight" : null,
        this.props.source.options ? this.props.source.options.indented : null
    );

    return (
      <section className="SheetOutsideText">
        <div className={containerClasses} data-node={this.props.source.node} onClick={(e) => this.shouldPassClick(e)} aria-label={"Click to see " + this.props.linkCount +  " connections to this source"} tabIndex="0" onKeyPress={function(e) {e.charCode == 13 ? this.props.sheetSourceClick(e):null}.bind(this)} >

          <div className={lang}>{this.props.source.options && this.props.source.options.sourcePrefix && this.props.source.options.sourcePrefix != "" ? <sup className="sourcePrefix">{this.props.source.options.sourcePrefix}</sup> : null }
              <div className="sourceContentText" dangerouslySetInnerHTML={ {__html: Sefaria.util.cleanHTML(this.props.source.outsideText)} }></div>
          </div>

          <div className="clearFix"></div>

          {this.props.source.addedBy ?
          <div className="addedBy">
            <small><em>{Sefaria._("Added by")}: <span dangerouslySetInnerHTML={ {__html: Sefaria.util.cleanHTML(this.props.source.userLink)} }></span></em></small>
          </div>
          : null }

        </div>
      </section>
    );
  }
}


class SheetOutsideBiText extends Component {
  render() {
    const containerClasses = classNames(
      "sheetItem",
      "segment",
      (this.props.source.outsideBiText.en && this.props.source.outsideBiText.en.stripHtml() === "...") || (!this.props.source.outsideBiText.en.stripHtml()) ? "heOnly" : null,
      (this.props.source.outsideBiText.he && this.props.source.outsideBiText.he.stripHtml() === "...") || (!this.props.source.outsideBiText.he.stripHtml()) ? "enOnly" : null,
      this.props.highlightedNode == this.props.source.node ? "highlight" : null,
    );

    const sectionClasses= classNames("SheetOutsideBiText",
      this.props.source.options ? this.props.source.options.indented : null,
    );

    return (
      <section className={sectionClasses}>
        <div className={containerClasses} data-node={this.props.source.node} onClick={this.props.sheetSourceClick} aria-label={"Click to see " + this.props.linkCount +  " connections to this source"} tabIndex="0" onKeyPress={function(e) {e.charCode == 13 ? this.props.sheetSourceClick(e):null}.bind(this)} >

          <div className="he">
            {this.props.source.options && this.props.source.options.sourcePrefix && this.props.source.options.sourcePrefix != "" ? <sup className="sourcePrefix">{this.props.source.options.sourcePrefix}</sup> : null }
            <div className="sourceContentText outsideBiText" dangerouslySetInnerHTML={ {__html: Sefaria.util.cleanHTML(this.props.source.outsideBiText.he)} }></div>
          </div>
          <div className="en">
            {this.props.source.options && this.props.source.options.sourcePrefix && this.props.source.options.sourcePrefix != "" ? <sup className="sourcePrefix">{this.props.source.options.sourcePrefix}</sup> : null }
            <div className="sourceContentText outsideBiText" dangerouslySetInnerHTML={ {__html: Sefaria.util.cleanHTML(this.props.source.outsideBiText.en)} }></div>
          </div>

          <div className="clearFix"></div>

          {this.props.source.addedBy ?
          <div className="addedBy">
            <small><em>{Sefaria._("Added by")}: <span dangerouslySetInnerHTML={ {__html: Sefaria.util.cleanHTML(this.props.source.userLink)} }></span></em></small>
          </div>
          : null }

        </div>
      </section>
    );
  }
}


class SheetMedia extends Component {
  makeMediaEmbedContent() {
    var mediaLink;
    var mediaCaption = "";
    var mediaClass = "media fullWidth";
    var mediaURL = this.props.source.media;
    var caption  = this.props.source.caption;

    if (this.isImage()) {
      mediaLink = '<img class="addedMedia" src="' + mediaURL + '" />';
    }
    else if (mediaURL.match(/https?:\/\/www\.youtube\.com\/embed\/.+?rel=0(&amp;|&)showinfo=0$/i) != null) {
      mediaLink = '<div class="youTubeContainer"><iframe width="100%" height="100%" src=' + mediaURL + ' frameborder="0" allowfullscreen></iframe></div>';
    }

    else if (mediaURL.toLowerCase().match(/https?:\/\/player\.vimeo\.com\/.*/i) != null) {
      mediaLink = '<div class="youTubeContainer"><iframe width="100%" height="100%" src=' + mediaURL + ' frameborder="0"  allow="autoplay; fullscreen" allowfullscreen></iframe></div>';
    }

    else if (mediaURL.match(/https?:\/\/w\.soundcloud\.com\/player\/\?url=.*/i) != null) {
      mediaLink = '<iframe width="100%" height="166" scrolling="no" frameborder="no" src="' + mediaURL + '"></iframe>';
    }

    else if (mediaURL.match(/\.(mp3)$/i) != null) {
      mediaLink = '<audio src="' + mediaURL + '" type="audio/mpeg" controls>Your browser does not support the audio element.</audio>';
    }

    else {
      mediaLink = 'Error loading media...';
    }

    if (caption && (caption.en || caption.he) ) {
      var cls = caption.en && caption.he ? "" : caption.en ? "enOnly" : "heOnly";
      mediaCaption = "<div class='mediaCaption " + cls + "'><div class='mediaCaptionInner'>" +
                "<div class='en'>" + (caption.en || "") + "</div>" +
                "<div class='he'>" + (caption.he || "") + "</div>" +
                 "</div></div>";
    }

    return "<div class='" + mediaClass + "'>" + mediaLink + mediaCaption + "</div>";
  }
  isImage() {
    return (this.props.source.media.match(/\.(jpeg|jpg|gif|png)$/i) != null);
  }
  render() {
    if (this.props.hideImages && this.isImage()) { return null; }
    const containerClasses = classNames(
      "sheetItem",
      "segment",
      this.props.highlightedNode === this.props.source.node ? "highlight" : null,
      this.props.source.options ? this.props.source.options.indented : null
    );
    return (
      <section className="SheetMedia">
        <div className={containerClasses} data-node={this.props.source.node} onClick={this.props.sheetSourceClick} aria-label={"Click to  " + this.props.linkCount +  " connections to this source"} tabIndex="0" onKeyPress={function(e) {e.charCode == 13 ? this.props.sheetSourceClick(e):null}.bind(this)} >

          <div className="sourceContentText centeredSheetContent" dangerouslySetInnerHTML={ {__html: this.makeMediaEmbedContent()} }></div>
          <div className="clearFix"></div>
          {this.props.source.addedBy ?
            <div className="addedBy"><small><em>{Sefaria._("Added by")}: <span dangerouslySetInnerHTML={ {__html: Sefaria.util.cleanHTML(this.props.source.userLink)} }></span></em></small></div>
            : null }
        </div>
      </section>
    );
  }
}
export default SheetContent;