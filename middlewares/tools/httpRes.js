const respond = function(res, code , msg , data) {

    let hasError = false;
    let success = true;

    switch (code) {
        case 200:
            msg = msg ?? 'Success';
            break;
        case 201:
            msg = msg ?? 'Added!';
            break;
        case 400:
            msg = msg ?? 'Bad Request!';
            hasError = true;
            success = false;
            break;
        case 401:
            msg = msg ?? 'Unathorized!';
            hasError = true;
            success = false;
            break;
        case 404:
            msg = msg ?? 'Not Found!';
            hasError = true;
            success = false;
            break;
        case 409:
            msg = msg ?? 'Conflict';
            hasError = true;
            success = false;
            break;
        case 500:
            msg = msg ?? 'Sever hasError!';
            hasError = true;
            success = false;
            break;
        default:
            msg = msg ?? null;
            break;
    }

    const playload = {msg, hasError, success};
    if (data !== undefined) {
        playload.data = data;
    }

    return res.status(code).json(playload);
}

export default respond;