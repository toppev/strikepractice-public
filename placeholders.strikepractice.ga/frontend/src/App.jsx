import { useEffect, useState, useMemo } from "react";
import copy from "clipboard-copy";
import axios from "axios";
import clsx from "clsx";

// const API_URL = 'http://localhost:3030'
const API_URL = '/api'

// Hook for debouncing values
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// Placeholder item component
function PlaceholderItem({ placeholder, currentValue }) {
    const placeholderAPI = "%strikepractice_" + placeholder.substring(1, placeholder.length - 1) + '%';

    return (
        <div className="px-4 py-2">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-blue-500/50 rounded-lg p-4 transition-all duration-200 shadow-lg hover:shadow-blue-500/10 group">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-blue-400 font-semibold truncate">{placeholder}</span>
                            <CopyButton text={placeholder} color="blue" />
                        </div>
                        <div className="text-gray-400 text-sm truncate">
                            Value: <span className="text-gray-200">{currentValue}</span>
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col items-start md:items-end">
                         <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-500 text-xs uppercase tracking-wider font-bold">PAPI</span>
                            <CopyButton text={placeholderAPI} color="purple" />
                        </div>
                        <span className="font-mono text-purple-400 text-sm truncate max-w-full">{placeholderAPI}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function App() {
    const [data, setData] = useState({ placeholders: [] });
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Debounce search to prevent freezing while typing
    const debouncedSearch = useDebounce(search, 300);

    const filteredPlaceholders = useMemo(() => {
        if (!debouncedSearch?.trim()) {
            return [];
        }
        
        const searchTerms = debouncedSearch.toLowerCase().split(' ').filter(Boolean);
        if (!searchTerms.length) return [];

        return (data?.placeholders?.filter(it => {
            const placeholderStr = it.placeholder.toLowerCase();
            const valueStr = String(it.currentValue).toLowerCase();
            return searchTerms.every(term => 
                placeholderStr.includes(term) || valueStr.includes(term)
            );
        }) || []).sort((a, b) => a.placeholder.localeCompare(b.placeholder));
    }, [debouncedSearch, data]);

    useEffect(() => {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const token = urlSearchParams.get('token');
        
        if (!token) {
            setLoading(false);
            // Optional: Set a demo state or error if no token is mostly for dev
            return;
        }

        axios.post(`${API_URL}/get-data`, { token })
            .then(res => {
                const fetchedData = res.data.data;
                const regex = /^<(opponent|teammate|opponent_colored|teammate_colored)\d+>$/;
                if (fetchedData && fetchedData.placeholders) {
                    fetchedData.placeholders = fetchedData.placeholders.filter(it => !regex.test(it.placeholder));
                    setData(fetchedData);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.response?.data?.message || "Failed to load data.");
                setLoading(false);
            });
    }, []);


    return (
        <div className="min-h-screen bg-[#0a0d14] text-white selection:bg-blue-500/30 selection:text-blue-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-screen">
                
                {/* Header Section */}
                <div className="flex-none pt-10 pb-6 text-center z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x tracking-tight mb-4">
                        StrikePractice
                        <span className="block text-2xl md:text-3xl text-gray-500 mt-2 font-medium">Placeholders</span>
                    </h1>
                    
                    <div className="bg-gray-900/50 inline-block px-6 py-3 rounded-full border border-gray-800 shadow-xl backdrop-blur-md mb-8">
                        <p className="text-gray-400 font-medium">
                            Type <code className="text-blue-400 bg-blue-400/10 px-2 py-1 rounded">/sprac placeholders</code> on your server!
                        </p>
                    </div>

                    {/* Search Input */}
                    <div className="max-w-2xl mx-auto relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <input
                            type="text"
                            className="relative w-full bg-[#151a23] border border-gray-700 text-gray-100 text-lg rounded-xl px-6 py-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-600 transition-all shadow-2xl"
                            placeholder="Search placeholders..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            autoFocus
                        />
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                            {filteredPlaceholders.length} found
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 min-h-0 pb-8 w-full max-w-5xl mx-auto flex flex-col">
                    
                    {!loading && !error && (
                        <div className="flex justify-between items-center mb-4 px-2">
                             <p className="text-gray-400 text-sm">
                                {search.trim().length === 0 ? (
                                    <span>Total loaded: {data?.placeholders?.length || 0}</span>
                                ) : (
                                    <span>Showing matches for "{search}"</span>
                                )}
                            </p>
                            <button
                                onClick={() => setSearch(" ")}
                                disabled={search === " "}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium rounded-lg transition-colors border border-gray-700 text-blue-400"
                            >
                                Show All
                            </button>
                        </div>
                    )}

                    <div className="flex-1 bg-[#11151c] rounded-2xl border border-gray-800 shadow-2xl overflow-y-auto relative">
                        {loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#11151c]/80 backdrop-blur-sm">
                                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                                <p className="text-blue-400 font-medium animate-pulse">Loading data...</p>
                            </div>
                        )}

                        {error && (
                             <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-4">
                                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                                <h3 className="text-xl font-bold text-white mb-2">Error Loading Data</h3>
                                <p className="text-red-400">{error}</p>
                            </div>
                        )}

                        {!loading && !error && filteredPlaceholders.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                                <div className="text-4xl mb-2">🔍</div>
                                <p>No placeholders found matching your search.</p>
                            </div>
                        )}

                        {!loading && !error && filteredPlaceholders.length > 0 && (
                            <div className="py-2">
                                {filteredPlaceholders.map((item) => (
                                    <PlaceholderItem
                                        key={item.placeholder}
                                        placeholder={item.placeholder}
                                        currentValue={item.currentValue}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CopyButton({ text, color }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await copy(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const colors = {
        blue: "text-blue-500 hover:text-blue-400 hover:bg-blue-500/10",
        purple: "text-purple-500 hover:text-purple-400 hover:bg-purple-500/10"
    };

    const activeColor = colors[color] || colors.blue;

    return (
        <button
            onClick={handleCopy}
            className={clsx(
                "p-1.5 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900",
                activeColor,
                copied ? "focus:ring-green-500" : `focus:ring-${color}-500`
            )}
            title="Copy to clipboard"
        >
             {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )}
        </button>
    );
}

export default App;
