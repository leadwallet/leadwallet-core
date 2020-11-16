import { Environment } from "../../env";
import syncReq from "sync-request";
const COINGECKO_COINS_ROOT = "https://api.coingecko.com/api/v3/coins";
export const options = {
    simple: false,
    json: true,
    resolveWithFullResponse: true,
    headers: {
        "Content-Type": "application/json",
        "X-API-Key": Environment.CRYPTO_API_KEY
    }
};

// ALL_COINS is the list of top coins to be supported
export const ALL_COINS = ["abbc", "ada", "algo", "ant", "ar", "atom", "avax", "bal",
	"band", "bat", "bcd", "bch", "bnb", "bsv", "btc", "btg", "btt", "busd", "cel", 
	"celo", "ckb", "comp", "cro", "cvt", "dai", "dash", "dcr", "dgb", "doge", "dot", 
	"dx", "egld", "enj", "eos", "etc", "eth", "ewt", "ftt", "hbar", "hedg", "ht", "husd", 
	"hyn", "icx", "knc", "ksm", "lend", "leo", "link", "lrc", "lsk", "ltc", "luna", 
	"mana", "miota", "mkr", "nano", "neo", "nxm", "ocean", "okb", "omg", "ont", "oxt", 
	"pax", "pma", "qnt", "qtum", "ren", "rep", "rev", "rvn", "sc", "snx", "sol", "storj", 
	"stx", "sushi", "sxp", "theta", "tmtg", "trx", "tusd", "uma", "uni", "usdc", "usdt", 
	"vet", "waves", "wbtc", "xem", "xlm", "xmr", "xrp", "xtz", "yfi", "zb", "zec", "zil", "zrx"]
export const CURRENT_ERC20_TOKENS = ["usdt", "link", "bnb", "usdc", "wbtc", "cdai", "cro",
	"okb", "leo", "dai", "wfil", "uni", "ht", "aave", "ven", "cel", "busd", "theta", "snx",
	"ceth", "yfi", "comp", "omg", "mkr", "uma", "pax", "cusdc", "renbtc", "bat", "husd",
	"tusd", "zrx", "ren", "zil", "lrc", "ocean", "qnt", "ampl", "knc", "nxm", "rsr", "sushi",
	"enj", "band", "bal", "nmr", "nexo", "ant", "mana", "gnt", "snt", "btm", "chsb", "crv",
	"hot", "lend", "iost", "matic", "cvc", "paxg", "sxp", "repv2", "rlc", "uqc", "kcs", "hbtc",
	"cuni", "divx", "gno", "utk", "chz", "susd", "srm", "czrx", "wax", "ubt", "storj", "rpl",
	"ankr", "bnt", "agi", "ftm", "iotx", "dnt", "poly", "elf", "pnk", "npxs", "zb", "core",
	"powr", "trb", "wnxm", "musd", "eurs", "trac", "btu", "one", "cusdt", "wic", "lpt", "aion",
	"btmx", "bnana", "usdk", "dgtx", "vgx", "fet", "qkc", "data", "dia", "axs", "eng", "gard",
	"adx", "stake", "ogn", "dip", "bzrx", "zt", "nec", "ult", "ycc", "mxc", "mln", "nuls",
	"aura", "loom", "cream", "sand", "boa", "c20", "mft", "fun", "icn", "keep", "mco",
	"mtl", "zap", "rcn", "req", "dec", "crpt", "qsp", "akro", "blz", "ast","celr", "net", "bel",
	"stmx", "cnd", "orbs", "dent", "mta", "fsn", "gusd", "stpt", "cov", "cre", "fx", "perp",
	"safe2", "dmg", "dusk", "salt", "aergo", "df", "nas", "rdn", "medx", "dgd", "nkn", "lamb",
	"pltc", "qntu", "plu", "b2bx", "drep", "mrph", "chr", "bz", "xet", "qash", "mda", "prom",
	"zcn", "sai", "cocos", "kan", "drgn", "sntvt", "cbc", "st", "tkn", "instar", "met", "yam",
	"ppt", "iqn", "qrl", "vite", "pnt", "wtc", "veri", "based", "ghst", "cbat", "mdt", "pma",
	"dew", "san", "tel", "dxd", "dmt", "abt", "dtx", "awc", "like", "loc", "aoa", "bhpc", "dos",
	"hakka", "grid", "cmt", "srn", "key", "man", "rfr", "top", "pay", "arc", "dock", "dext",
	"swftc", "upp", "poa20", "bix", "lcx", "dgx", "itc", "foam", "tau", "utnp", "evx", "xmx", "gvt",
	"sngls", "pre", "ionc", "odem", "gen", "cfi", "jrt", "rev", "pro", "moc", "npx", "nct", "pai",
	"brd", "snm", "mitx", "wpr", "snc", "tct", "cdt", "beat", "wabi", "uct", "gto", "you", "sent",
	"rnt", "sense", "rari", "wings", "fair", "vee", "spank", "roobee", "ngc", "spnd", "abl", "gnx",
	"bmc", "mtc", "spc", "get", "ruff", "oax", "plr", "hpb", "qun", "soc", "dentacoin", "edr", "dht",
	"qau", "auc", "baas", "pbtc", "bdt", "bc", "neu", "mwat", "dlt", "can", "egt", "yee", "czr", "mcb",
	"uuu", "abyss", "jnt", "lgo", "ten", "ivy", "vibe", "oio", "lba", "bznt", "bok", "int", "vib", "mds",
	"uip", "front", "bitto", "sda", "qbx", "blt", "appc", "mth", "ocn", "dacc", "xyo", "ghost", "flot",
	"cbt", "hit", "cwbtc", "bcpt", "ugas", "amb", "idrt", "daps", "bkbt", "1wo", "card", "cag",
	"auto", "dcc", "skm", "amlt", "zmn", "hydro", "la", "geeq", "cs", "cpay", "cln", "xaurum", "cnn",
	"rox", "trio", "bcdt", "amn", "box", "cv", "ttu", "lxt", "rem", "ucash", "mfg", "coni", "dagt", "ogo",
	"avt", "krl", "yoyow", "cpc", "chx", "air", "adst", "cxo", "htb", "tnt", "boe", "bcv", "hmc",
	"axpr", "eko", "tfl", "chp", "ss", "hold", "vin", "dsla", "mt", "hmq", "ntk", "drt", "gene", "iic",
	"vsf", "use", "exrn", "hvn", "adel", "time", "dax", "cet", "ncash", "ndx", "bpt", "ethv", "cos", "zip",
	"tol", "sntr", "ctr", "wis", "nbc", "fti", "bepro", "spn", "zxc", "bitx", "stm", "adb", "ftn", "lky",
	"blue", "etbs", "mlc", "knt", "bgbp", "atn", "ins", "iov", "inxt", "qch", "dit", "deb", "edu", "bqtx",
	"credo", "edn", "atl", "vld", "ctxc", "pst", "mozo", "dat", "ppp", "ptn", "fnkos", "own", "bax", "gim",
	"iht", "yeed", "hsc", "dth", "hkn", "bto", "snet", "mtn", "rpd", "ebc", "ong", "tbx", "ssp", "ubex", "hat",
	"free", "dappt", "gmt", "rating", "zco", "real", "wco", "fyp", "ptoy", "banca", "talao", "0xbtc",
	"astro", "aid", "gse", "chart", "face", "next"]
// CURRENT_COINS is the list of supported coins as of now
export const CURRENT_COINS: Array<string> = ["btc","ltc","eth","dash","doge","trx"]
export const CRYPTO_API_COINS: Array<string> = ["btc","ltc","eth","dash","doge"]
export const COIN_NETWORK = {
    btc : {
        development: "testnet",
        production: "mainnet",
        test: "testnet",
        staging: "testnet"
    },
    ltc : {
        development: "testnet",
        production: "mainnet",
        test: "testnet",
        staging: "testnet"
    },
    dash : {
        development: "testnet",
        production: "mainnet",
        test: "testnet",
        staging: "testnet"
    },
    doge : {
        development: "testnet",
        production: "mainnet",
        test: "testnet",
        staging: "testnet"
    },
    eth : {
        development: "ropsten",
        production: "mainnet",
        test: "ropsten",
        staging: "ropsten"
    }
};

function getCoins(): Map<string,any> {
	const response = syncReq('GET',COINGECKO_COINS_ROOT + "/list",{
		headers: {
			"Content-Type": "application/json"
		}
	}).getBody("utf-8");
	let coinsMap = new Map<string,any>();
	const coinsList = JSON.parse(response) as Array<any>;
	for (const coin of coinsList) {
		coinsMap.set(coin["symbol"],coin);
	}
	return coinsMap;
}

export const COINS_MAP: Map<string,any> = getCoins();

function getCoinsImageUrls(coins :Array<string>): Map<string,any> {
	let coinsImageUrls: Map<string,any> = new Map();
	for (const coin of coins) {
		const response = syncReq('GET',COINGECKO_COINS_ROOT + "/" + COINS_MAP.get(coin)["id"] 
		+ "?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false",{
			headers: {
				"Content-Type": "application/json"
			}	
		}).getBody("utf-8");
		const imageUrls = JSON.parse(response)["image"];
		coinsImageUrls.set(coin, imageUrls);
	}
	return coinsImageUrls;
}

export const COINS_IMAGE_URLS: Map<string,any> = getCoinsImageUrls(CURRENT_COINS);

function createSymbolToIdMapping() {
	let symbolIdMap = new Map<string,string>();
	let idSymbolMap = new Map<string,string>();
	for (const coin of CURRENT_COINS) {
		symbolIdMap.set(coin,COINS_MAP.get(coin)["id"]);
		idSymbolMap.set(COINS_MAP.get(coin)["id"],coin);
	}
	return [symbolIdMap,idSymbolMap];
}

export const [SYMBOL_ID_MAPPING, ID_SYMBOL_MAPPING] = createSymbolToIdMapping();

export function getExplorerLink(type: string, txHash: string) : string {
    return type == "trx"
      ? Environment.TRON_EXPLORER[process.env.NODE_ENV] + "/" + txHash
      : Environment.BLOCK_EXPLORER + "/" + type + "/" + COIN_NETWORK[type][process.env.NODE_ENV] + "/tx/" + txHash;
}