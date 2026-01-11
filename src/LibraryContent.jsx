import ListItem from "./ListItem";
import Cards from "./Cards";

export default function LibraryContent({items=[], handleRate, editingItem, setEditingItem, isListView, currentItem, onDelete}) {
    return(
        <div className={isListView?"list-cards":"grid-cards"}>
        {items.map(it => {
        if (it.type !== currentItem) return null;

            return isListView ? (
            <ListItem
                key={it.id}
                item={it}
                onRate={handleRate}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
                onDelete={onDelete}
            />
            ) : (
            <Cards
                key={it.id}
                item={it}
                onRate={handleRate}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
                isLibrary={1}
                onDelete={onDelete}
            />
            );
      })}
            
        </div>
    );
}