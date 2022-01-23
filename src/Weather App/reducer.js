export function reducer(state, action) {
    const TYPE = {
        LOCATION: "USER_LOCATION",
        NOT_FOUND_LOCATION: "LOCATION_404",
        REQUEST: "REQ_CITY",
        NOT_FOUND: "CITY_404",
        NEW_CITY: "SET_CITY",
        DISABLE_ERROR: "DISABLE_ERROR"
    };

    switch(action.type) {
        case TYPE.LOCATION:
            const { lat, long } = action.payload;
            
            return {
                ...state,
                coords: { lat: lat, long: long }
            }

        case TYPE.NOT_FOUND_LOCATION:
            const { invLat, invLong } = action.payload;
            
            return {
                ...state,
                coords: { lat: 0, long: 0 },
                errorModal: `ERROR: Invalid lat or long (<span>${invLat}</span>, <span>${invLong}</span>)`
            }
        
        case TYPE.REQUEST:
            return {
                ...state,
                reqCity: action.payload,
                loadingModal: `Searching for <span>${action.payload}</span>...`
            }

        case TYPE.NOT_FOUND: 
            return {
                ...state,
                reqCity: "",
                errorModal: `ERROR: <span>${action.payload}</span> not found!`,
                loadingModal: ""
            }

        case TYPE.NEW_CITY:
            return {
                ...state,
                currentCity: action.payload,
                reqCity: "",
                loadingModal: ""
            }

        case TYPE.DISABLE_ERROR:
            return {
                ...state,
                errorModal: ""
            }
            
        default: throw new Error("No such action type!");
    }
}