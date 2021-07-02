import {
    Box,
    Button,
    Card,
    createStyles,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    makeStyles,
    TextField,
    Tooltip,
    Typography
} from "@material-ui/core";
import { useEffect, useState } from "react";
import copy from "clipboard-copy";
import FileCopyIcon from '@material-ui/icons/FileCopy';
import axios from "axios";

// const API_URL = 'http://localhost:3030'
const API_URL = '/api'

const useStyles = makeStyles(theme =>
    createStyles({
        center: {
            textAlign: 'center'
        },
        search: {
            maxWidth: '400px',
            minWidth: '300px',
        },
        tokenField: {
            width: '300px'
        },
        placeholderList: {
            textAlign: 'center',
            margin: 'auto',
            maxWidth: '600%'
        }
    }));

function App() {

    const classes = useStyles()

    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const filteredPlaceholders =
        (data?.placeholders?.filter(it => new RegExp(search, 'i').test(JSON.stringify(it))) || [])
            .sort((a, b) => a.placeholder.localeCompare(b.placeholder))

    useEffect(() => {
        async function fetchData() {
            try {
                const urlSearchParams = new URLSearchParams(window.location.search);
                const token = urlSearchParams.get('token')
                if (!token) {
                    setLoading(false)
                    return;
                }
                const res = await axios.post(`${API_URL}/get-data`, { token });
                const data = res.data.data
                data.placeholders = data.placeholders.filter(it =>
                    !it.placeholder.startsWith('<opponent_colored') &&
                    !it.placeholder.startsWith('<teammate_colored') &&
                    (it.placeholder.length > 12 || (!it.placeholder.startsWith("<opponent") && !it.placeholder.startsWith("<teammate")))
                )
                setData(data)
                setLoading(false)
            } catch (err) {
                window.alert(err.response?.data?.message || err)
            }
        }

        fetchData().then()
    }, [])

    return (
        <div className={classes.center}>
            <Typography variant="h1" color="primary"
                        style={{ margin: '60px 0px', marginTop: '20px', fontSize: '36px' }}>StrikePractice Placeholders</Typography>

            <div>

                <div style={{ padding: '20px' }}>
                    <p style={{ fontSize: '18px', color: '#4c4c4c' }}>
                        Type <code>/sprac placeholders</code> on your server!
                    </p>
                </div>

                <TextField
                    style={{ margin: '50px 0px' }}
                    className={classes.search}
                    placeholder="Search placeholders..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                <div style={{ maxWidth: '1100px', margin: 'auto' }}>
                    <p>{filteredPlaceholders?.length || 0} placeholders found</p>
                    <List className={classes.placeholderList}>
                        {filteredPlaceholders?.map(it => {
                            const placeholderAPI = "%strikepractice_" + it.placeholder.substring(1, it.placeholder.length - 1) + '%'
                            return (
                                <ListItem key={it.placeholder}>
                                    <Card style={{ width: '100%', padding: '0 10%' }}>
                                        <Box display="flex" flexDirection="row" style={{ justifyContent: 'space-between' }}>
                                            <ListItemText
                                                primary={`Current value: ${it.currentValue}`}
                                                secondary={<>
                                                    <span>PlaceholderAPI: {placeholderAPI}</span>
                                                    <CopyText color="primary" text={placeholderAPI}/>
                                                </>}
                                            />
                                            <p style={{ margin: '20px' }}>
                                                {it.placeholder}
                                            </p>
                                            <CopyText color="secondary" text={it.placeholder}/>
                                        </Box>
                                    </Card>
                                </ListItem>
                            );
                        })}
                    </List>
                    {loading && <LinearProgress/>}
                    {!loading && filteredPlaceholders?.length === 0 && <p>No placeholders found...</p>}
                </div>

            </div>
        </div>
    );
}

function CopyText({ text, color }) {

    return (
        <CopyToClipboard>
            {({ copy }) => (
                <Button
                    size="small"
                    color={color}
                    onClick={() => copy(text)}
                    endIcon={<FileCopyIcon/>}
                >Copy</Button>
            )}
        </CopyToClipboard>
    )
}

function CopyToClipboard(props) {

    const [tooltip, setTooltip] = useState(false);

    const onCopy = async (content) => {
        await copy(content);
        setTooltip(true)
    };

    return <Tooltip
        open={tooltip}
        title={"Copied to clipboard!"}
        leaveDelay={1500}
        onClose={() => setTooltip(false)}
    >
        {props.children({ copy: onCopy })}
    </Tooltip>;
}


export default App;
