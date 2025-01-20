import React, { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuItem, DropdownMenuItemWithIcon, DropdownMenuSeparator } from "../common/DropdownMenu";
import { SaveButtonWithText } from "../Misc";
import Sefaria from "../sefaria/sefaria";
import Button from "../common/Button";
import ReactTags from "react-tag-autocomplete";
import { SignUpModalKind } from "../sefaria/signupModalContent";
import { ShareModal, SaveModal, GoogleDocExportModal, CollectionsModal, CopyModal, DeleteModal } from "./SheetModals";

const modifyHistoryObjectForSheetOptions = (historyObject) => {
  // we want the 'ref' property to be for the sheet itself and not its segments, as in "Sheet 3" not "Sheet 3:4"
  // because in the modularization version of the sheets viewer, the UI is designed so that the sheet is saved, not a specific segment
  let newHistoryObject = Object.assign({}, historyObject);
  const refParts = newHistoryObject.ref.split(":");
  newHistoryObject.ref = refParts[0];
  return newHistoryObject;
}

const getExportingStatus = () => {
  const urlHashObject = Sefaria.util.parseHash(Sefaria.util.parseUrl(window.location).hash).afterLoading;
  return urlHashObject === "exportToDrive";
}

const SheetOptions = ({historyObject, toggleSignUpModal, sheetID, authorUrl, editable, postSheet, status, handleCollectionsChange}) => {
  // `editable` -- whether the sheet belongs to the current user
  const [sharingMode, setSharingMode] = useState(false); // Share Modal open or closed
  const [collectionsMode, setCollectionsMode] = useState(false);  // Collections Modal open or closed
  const [copyingMode, setCopyingMode] = useState(false);
  const [savingMode, setSavingMode] = useState(false);
  const [exportingMode, setExportingMode] = useState(getExportingStatus());
  const [deletingMode, setDeletingMode] = useState(false);
  const [publishingMode, setPublishingMode] = useState(false);
  const historyObjectForSheet = modifyHistoryObjectForSheetOptions(historyObject);

  const getSignUpModalKind = () => {
    if (savingMode) {
      return SignUpModalKind.Save;
    }
    else if (collectionsMode) {
      return SignUpModalKind.AddToSheet;
    }
    else if (copyingMode) {
      return SignUpModalKind.AddToSheet;
    }
    else if (exportingMode) {
      return SignUpModalKind.Default;
    }
  }

  useEffect(() => {
    if ((collectionsMode || savingMode || copyingMode || exportingMode) && !Sefaria._uid) {
      toggleSignUpModal(getSignUpModalKind());
      setCopyingMode(false);
      setCollectionsMode(false);
      setSavingMode(false);
      setExportingMode(false);
    }
  }, [collectionsMode, savingMode, copyingMode, exportingMode]);
  if (sharingMode) {
    return <ShareModal sheetID={sheetID} isOpen={sharingMode} close={() => setSharingMode(false)}/>;
  }
  else if (collectionsMode) {
    return <CollectionsModal
                          isOpen={collectionsMode}
                          close={() => setCollectionsMode(false)}
                          handleCollectionsChange={handleCollectionsChange}
                          sheetID={sheetID}/>;
  }
  else if (copyingMode) {
    return <CopyModal close={() => setCopyingMode(false)} sheetID={sheetID}/>;
  }
  else if (savingMode) {
    return <SaveModal historyObject={historyObjectForSheet} close={() => setSavingMode(false)}/>;
  }
  else if (exportingMode) {
    return <GoogleDocExportModal close={() => setExportingMode(false)} sheetID={sheetID}/>;
  }
  else if (deletingMode) {
    return <DeleteModal close={() => setDeletingMode(false)} sheetID={sheetID} authorUrl={authorUrl}/>;
  }
  else if (publishingMode) {
    return <PublishModal close={() => setPublishingMode(false)}
                         sheetID={sheetID}
                         status={status}
                         postSheet={postSheet}/>;
  }
  const publishModalButton = <Button className="small publish" onClick={() => setPublishingMode(true)}>Publish</Button>;
  return (
        <>
        {editable && status === 'unlisted' && publishModalButton}
        <DropdownMenu positioningClass="headerDropdownMenu" buttonComponent={<img src="/static/icons/ellipses.svg" alt="Options"/>}>
          <div className="dropdownLinks-options">
          <DropdownMenuItem>
            <SaveButtonWithText
                historyObject={historyObjectForSheet}
                onClick={() => setSavingMode(true)}
            />
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CopyButton onClick={() => setCopyingMode(true)}/>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CollectionsButton setCollectionsMode={setCollectionsMode} editable={editable}/>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <GoogleDocExportButton sheetID={sheetID} onClick={() => setExportingMode(true)}/>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ShareButton onClick={() => setSharingMode(true)}/>
          </DropdownMenuItem>
          {editable && status === 'public' && <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                  <UnpublishButton onClick={() => setPublishingMode(true)}/>
                                                </DropdownMenuItem>
                                              </>
          }
          {editable && <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <DeleteButton onClick={() => setDeletingMode(true)}/>
                        </DropdownMenuItem>
                      </>
          }
          </div>
        </DropdownMenu>
        </>
    );
}

const ShareButton = ({onClick}) => {
  return <DropdownMenuItemWithIcon icon={"/static/img/share.svg"}
              textEn={'Share'}
              textHe={'שיתוף'}
              descEn={""}
              descHe={""}
              onClick={onClick}/>
}

const DeleteButton = ({onClick}) => {
    const handleClick = () => {
      if (confirm(Sefaria._("Are you sure you want to delete this sheet? There is no way to undo this action."))) {
        onClick();
      }
    }
    return <DropdownMenuItemWithIcon icon={"/static/icons/trash.svg"}
              textEn={'Delete Sheet'}
              textHe={''}
              descEn={""}
              descHe={""}
              onClick={handleClick}/>
}

const UnpublishButton = ({onClick}) => {
  return <DropdownMenuItemWithIcon icon={"/static/icons/unpublish.svg"}
                                   textEn={'Unpublish'}
                                   textHe={""}
                                   descEn={""}
                                   descHe={""}
                                   onClick={onClick}/>
}

const CollectionsButton = ({setCollectionsMode, editable}) => {
  const label = editable ? "Edit Collections" : "Add to Collection";
  return <DropdownMenuItemWithIcon icon={"/static/icons/collection.svg"}
                                      textEn={label}
                                      textHe={Sefaria._(label)}
                                      descEn={""}
                                      descHe={""}
                                      onClick={() => setCollectionsMode(true)}/>
}

const CopyButton = ({onClick}) => {
  return <DropdownMenuItemWithIcon
              textEn={"Copy"}
              textHe={"העתקה"}
              descEn={""}
              descHe={""}
              icon="/static/img/copy.png"
              onClick={() => onClick()} />
}

const GoogleDocExportButton = ({ onClick }) => {
  const googleDriveText = { en: "Export to Google Docs", he: "ייצוא לגוגל דוקס" };
  return <DropdownMenuItemWithIcon
                         textEn={googleDriveText.en}
                         textHe={googleDriveText.he}
                         descEn={""}
                         descHe={""}
                         icon="/static/img/googledrivecolor.png"
                         onClick={() => onClick()} />;
}

export { SheetOptions };

