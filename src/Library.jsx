import React, { useState } from "react";
import LibraryContent from "./LibraryContent";

function Library({catagories =[], selectedCatagory, items=[], handleRate, editingItem, setEditingItem, isAtoZ, setAtoZ, onDelete, onExport, onImport}){
    const [isListView, setListView] = useState(1);

    const currentItem = catagories.find(i => i.id === selectedCatagory)?.label ?? "Items";
    return(
        <div id="library">
            <LibraryHeader 
                isListView={isListView}
                setListView={setListView}
                isAtoZ={isAtoZ}
                setAtoZ={setAtoZ}
                currentItem={currentItem}
                onExport={onExport}
                onImport={onImport}
            />
            <div className="content-view">
                <LibraryContent 
                    items={items}
                    handleRate={handleRate}
                    editingItem={editingItem}
                    setEditingItem={setEditingItem}
                    isListView={isListView}
                    currentItem={currentItem}
                    onDelete={onDelete}
                />
            </div>
            
        </div>
    );
}



function LibraryHeader({isListView, setListView, isAtoZ, setAtoZ, currentItem, onExport, onImport}){

    let currentViewIcon = isListView ? "./src/assets/list_view.png" : "./src/assets/grid_view.png";
    return(
        <div id="library-header">
            <h2>My {currentItem}</h2>
            <div id="view-options">
                <div className="imp-exp">
                    <button className="imp-exp-btn imp" onClick={() => document.getElementById("import-input").click()}>
                        <input
                            type="file"
                            accept="application/json"
                            id="import-input"
                            style={{ display: "none" }}
                            onChange={onImport}
                        />
                        Import
                    </button>
                    <button className="imp-exp-btn exp" onClick={() => onExport()}>Export</button>
                </div>
                <div className="current-sort">
                    {isAtoZ ? "A to Z" : "Rating (High to Low)"}
                    <button className="sort-btn" onClick={() => setAtoZ(s => !s)}>
                    {isAtoZ?"←":"↓"}
                </button>
                </div>
                
                <button className="view-btn" onClick={() => setListView(s => +!s)}>
                    <img src={currentViewIcon} title={"Switch to " + (isListView ? "Grid View":"List View")}></img>
                </button>
            </div>
        </div>
    );
}


export default React.memo(Library);