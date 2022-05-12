
async function requestPlayerMatchDeck(pId,pmId) {
    try {
        const response = await fetch(`/api/players/${pId}/playermatches/${pmId}/deck`);
        var result = await response.json();
        // We are not checking for errors (considering id exists)
        return result;
    } catch (err) {
        // Treat 500 errors here
        console.log(err);
    }
}



async function requestPlayerMatchInfo(id) {
    try {
        const response = await fetch(`/api/players/playermatches/${id}`);
        var result = await response.json();
        // We are not checking for errors (considering id exists)
        return result;
    } catch (err) {
        // Treat 500 errors here
        console.log(err);
    }
}



async function requestPlayerInfo(id) {
    try {
        const response = await fetch(`/api/players/${id}`);
        var result = await response.json();
        // We are not checking for errors (considering id exists)
        return result;
    } catch (err) {
        // Treat 500 errors here
        console.log(err);
    }
}
