
export default function Cards({isLibrary=1, item, onRate=null, editingItem=null, setEditingItem=null, onAdd=null, onDelete=null}) {
    if(!item) return null;
    const handleRatingClick = (id) => {
        setEditingItem(id);
    };
    const handleRatingChange = (id, rating) => {
        onRate(id, rating);
        setEditingItem(null);
    };
    const handleRatingBlur = () => {
        setEditingItem(null);
    };

    return(
        <div id="card">
            <div id="card-img">
                <img className="poster" src={item.poster} alt={item.title}></img>
            </div>
            <div id="card-title" className={isLibrary?"":"search-card"}>
                <p>{item.title}</p>
                {!isLibrary&&(
                    <>
                        <p style={{color:"#9EC8B9", fontWeight:"initial"}}>{item.year}</p> 
                        <button id="add-btn" onClick={() => {if (typeof onAdd === "function") onAdd(item);}}>Add</button>
                    </>)}
                {isLibrary === 1 &&(
                    <div id="rating-tab">
                        {editingItem === item.id ? (
                            <>
                                <select
                                    value={item.rating??0}
                                    onChange={(e) => handleRatingChange(item.id, Number(e.target.value))}
                                    onBlur={handleRatingBlur}
                                    autoFocus
                                    className="rating-select"
                                >
                                    <option value={0}>Unrated</option>
                                    {[...Array(10)].map((_, n) => (
                                        <option key={n+1} value={n+1}>{n+1}</option>
                                    ))}

                                </select>
                                
                            </>
                        ) : (
                            <div
                                className="rating-label"
                                onClick={() => handleRatingClick(item.id)}
                            >
                                {item.rating === 0 || item.rating == null ? (
                                    <span style={{ color: "#cbd5c1", fontSize:"12px" , fontWeight:"initial" }}>Unrated</span>
                                    ) : (
                                    <span style={{ color: "#16ff9b", fontWeight: "bold", fontSize:"12px" }}>{item.rating}</span>
                                    )}
                            </div>
                        )}
                    <button className="view-btn" onClick={()=>{if (typeof onDelete === "function") onDelete(item.id);}}> <img title="Delete" src="./src/assets/delete.png"></img></button>

                    </div>
                )}
                
            </div>
        </div>
    )
}
