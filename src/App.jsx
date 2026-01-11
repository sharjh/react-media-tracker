import { useState, useEffect, useMemo, useCallback, useRef } from "react";

import Library from "./Library.jsx";
import Cards from "./Cards.jsx";

function ResultPanel({results=[], isSearching, onAdd}){
    return(
        <div id="result-panel">
            <div id="result-header">{(isSearching || results.length > 0) && <h2>Results</h2>}</div>

            {isSearching ? (<div className="loaderbox"><div className="loader"></div></div>) : (
                <div className="content-view">
                <div className="grid-cards">
                    {Array.isArray(results) && results.map(iter => {
                        return (
                            <Cards 
                                key={iter.id ?? JSON.stringify(iter)}
                                item={iter}
                                isLibrary={0}
                                onAdd={onAdd}
                            />
                        )
                    })}
                </div>
            </div>)}

            
        </div>
    )
}

function CatagoryTabs({catagories, selectedCatagory, onSelect}) {
    return(
        <div className="catagory-tabs">
            {catagories.map(catagory => <button id={`cat-${catagory.id}`}
                                                key={catagory.id} 
                                                style={{backgroundImage:`url(${catagory.icon})`, backgroundRepeat:"no-repeat"}}
                                                aria-pressed={selectedCatagory==catagory.id}
                                                className={`${selectedCatagory===catagory.id?"active":""}`}
                                                onClick={() => onSelect(catagory.id)}
                                                >{catagory.label}</button>)}
        </div>
    );
}

function SearchBar({ onSearch, results=[],isSearching=false,onAdd }) {
    const [q, setQ] = useState("");
    function handleSubmit(e) {
        e.preventDefault();
        onSearch && onSearch(q.trim());
    }
    useEffect(() => {
        const t = setTimeout(() => {
            if(onSearch) onSearch(q.trim());
        }, 300);
        return () => clearTimeout(t);
    }, [q, onSearch])

    return(
        <div id="search">
            <form onSubmit={handleSubmit}>
                <input id="searchbar" type="text" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)}></input>
            </form>
            <ResultPanel
                results={results}
                isSearching={isSearching}
                onAdd={onAdd}
            />
        </div>
    );
}

function Header({catagories,selectedCatagory, setSelectedCatagory}) {
    return (
        <div id="header">
            <h1>Media Tracker</h1>
            <CatagoryTabs 
                catagories={catagories}
                selectedCatagory={selectedCatagory}
                onSelect={setSelectedCatagory}
            />
        </div>
    );
}


export default function MediaTracker() {
    const [selectedCatagory, setSelectedCatagory] = useState(1);
    const [items, setItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [isAtoZ, setAtoZ] = useState(true);

    //const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const onAdd = (item) => {
        setItems(prev => {
            if (prev.some(i => i.id === item.id)) return prev;
            return [ { ...item, rating: 0 }, ...prev ];
        });
        setSearchResults([]);
        setIsSearching(false);
    }

    const handleExport = () => {
        const data = JSON.stringify(items, null, 2); // readable JSON

        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "media-library.json";
        a.click();

        URL.revokeObjectURL(url);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);

                const importedItems = Array.isArray(parsed)
                    ? parsed
                    : parsed.data;

                if (!Array.isArray(importedItems)) {
                    alert("Invalid file format");
                    return;
                }

                setItems(importedItems);

            } catch {
                alert("Failed to import file");
            } finally {
                e.target.value = "";
            }
        };

        reader.readAsText(file);
    };


    const handleDelete = (id) => {
        console.log("delete id:", id);
        setItems(prev => {
        console.log("before:", prev.map(i => i.id));
        const next = prev.filter(item => item.id !== id);
        console.log("after:", next.map(i => i.id));
        return next;
        });
    };
    const searchControllerRef = useRef(null);
    const handleSearch = useCallback(async (q) => {
        // abort old request if any
        try {
            if (searchControllerRef.current) {
            searchControllerRef.current.abort();
            }
        } catch (e) {}
        searchControllerRef.current = null;

        if (!q) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        const controller = new AbortController();
        searchControllerRef.current = controller;

        try {
            let url = "";

            if (selectedCatagory === 1) {
                url = `https://api.rawg.io/api/games?key=${"<API-KEY>"}&search=${encodeURIComponent(q)}`;
            }
            else if (selectedCatagory === 2) {
                url = `https://api.themoviedb.org/3/search/movie?api_key=${"<API-KEY>"}&query=${encodeURIComponent(q)}`;
            }
            else if (selectedCatagory === 3) {
                url = `https://api.themoviedb.org/3/search/tv?api_key=${"<API-KEY>"}&query=${encodeURIComponent(q)}`;
            }
            else if (selectedCatagory === 4) {
                url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}`;
            }

            // raw API data
            const res = await fetch(url, { signal: controller.signal });
            const raw = await res.json();

            if(selectedCatagory === 1) {
                if (!raw || !Array.isArray(raw.results)) {
                    setSearchResults([]);
                } else {
                    const normalized = raw.results.map(game => {
                        return {
                            id: `rawg_${game.id}`,
                            title: game.name ?? "Untitled",
                            year: game.released ? game.released.slice(0, 4) : "",
                            poster: game.background_image ?? null,
                            type: "Games"
                        };
                });
                
                if (!controller.signal.aborted) {
                    setSearchResults(normalized);
                }}
            }

            else if (selectedCatagory === 2) {
                if (!raw || !Array.isArray(raw.results)) {
                    setSearchResults([]);
                } else {
                    const requiredKeys = ["poster_path", "release_date", "title"];

                    const normalized = raw.results.map(movie => {
                    const cleaned = requiredKeys.reduce((acc, key) => {
                        if (movie[key] !== undefined && movie[key] !== null) {
                        acc[key] = movie[key];
                        }
                        return acc;
                    }, {});

                    return {
                        id: movie.id,
                        title: cleaned.title ?? "Untitled",
                        year: cleaned.release_date ? cleaned.release_date.slice(0, 4) : "",
                        poster: cleaned.poster_path
                        ? `https://image.tmdb.org/t/p/w500${cleaned.poster_path}`
                        : null,
                        type:"Movies"
                    };
                });

                if (!controller.signal.aborted) {
                    setSearchResults(normalized);
                }}
            }
            // ------------------------------
            else if(selectedCatagory === 3) {
                if (!raw || !Array.isArray(raw.results)) {
                    setSearchResults([]);
                } else {
                    const requiredKeys = ["poster_path", "first_air_date", "name"];

                    const normalized = raw.results.map(movie => {
                    const cleaned = requiredKeys.reduce((acc, key) => {
                        if (movie[key] !== undefined && movie[key] !== null) {
                        acc[key] = movie[key];
                        }
                        return acc;
                    }, {});

                    return {
                        id: movie.id,
                        title: cleaned.name ?? "Untitled",
                        year: cleaned.first_air_date ? cleaned.first_air_date.slice(0, 4) : "",
                        poster: cleaned.poster_path
                        ? `https://image.tmdb.org/t/p/w500${cleaned.poster_path}`
                        : null,
                        type:"TV Shows"
                    };
                });

                if (!controller.signal.aborted) {
                    setSearchResults(normalized);
                }
            }
            }

            else if(selectedCatagory === 4) {
                if (!raw || !Array.isArray(raw.items)) {
                    setSearchResults([]);
                } else {
                    const normalized = raw.items.map(book => ({
                    id: `gbooks_${book.id}`,
                    title: book.volumeInfo?.title ?? "Untitled",
                    year: book.volumeInfo?.publishedDate
                        ? book.volumeInfo.publishedDate.slice(0, 4)
                        : "",
                    poster: book.volumeInfo?.imageLinks?.thumbnail ?? null,
                    type: "Books"
                    }));

                    if (!controller.signal.aborted) {
                        setSearchResults(normalized);
                    }
                }
            }

            else {
                if (!controller.signal.aborted) {
                    setSearchResults(raw.results);
                }
            }

        } catch (err) {
            if (err.name !== "AbortError") {
                console.error("search error:", err);
            }
            setSearchResults([]);
        } finally {
            if (searchControllerRef.current === controller) {
                searchControllerRef.current = null;
                setIsSearching(false);
            }
        }
        }, [selectedCatagory]);

    const displayedItems = useMemo(() => {
        const copy = [...items];
        if(isAtoZ) {
            return copy.sort((a,b) => (a.title || "").localeCompare(b.title || ""));
        }
        else {
            return copy.sort((a,b) => (b.rating || 0) - (a.rating || 0));
        }
    },[items, isAtoZ])

    const handleRate = useCallback((id, rating) => { 
        setItems(prev => prev.map(it => it.id === id ? { ...it, rating } : it)); },
        []);
    return (
        <section>
            <Header 
                catagories={catagories}
                selectedCatagory={selectedCatagory}
                setSelectedCatagory={setSelectedCatagory}
            />
            <SearchBar
                key={selectedCatagory}
                onSearch={handleSearch}
                results={searchResults}
                isSearching={isSearching}
                onAdd={onAdd}
            />

            <Library 
                catagories={catagories}
                selectedCatagory={selectedCatagory}
                items={displayedItems}
                handleRate={handleRate}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
                isAtoZ={isAtoZ}
                setAtoZ={setAtoZ}
                onDelete={handleDelete}
                onExport={handleExport}
                onImport={handleImport}
            />
        </section>
    );
}

const catagories = [
    {id:1, label:'Games', icon:"./src/assets/controller.png"},
    {id:2, label:'Movies', icon:"./src/assets/movie.png"},
    {id:3, label:'TV Shows', icon:"./src/assets/tv.png"},
    {id:4, label:'Books', icon:"./src/assets/book.png"}
];