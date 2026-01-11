export default function ListItem({item, onRate, editingItem, setEditingItem}) {
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
        <div id="list-item">
            {item.title+" "+String(item.year)}
            {
                <div id="rating-tab" style={{margin:"0"}}>
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
                                <button className="view-btn" onClick={()=>{if (typeof onDelete === "function") onDelete(item.id);}}> <img title="Delete" src="./src/assets/delete.png"></img></button>
                            </>
                        ) : (
                            <div
                                className="rating-label"
                                onClick={() => handleRatingClick(item.id)}
                                style={{padding:"4px 6px"}}
                            >
                                {item.rating === 0 || item.rating == null ? (
                                    <span style={{ color: "#cbd5c1", fontSize:"12px" , fontWeight:"initial" }}>Unrated</span>
                                    ) : (
                                    <span style={{ color: "#16ff9b", fontWeight: "bold", fontSize:"12px" }}>{item.rating}</span>
                                    )}
                            </div>
                        )}


                    </div>
            }
        </div>
    );
}