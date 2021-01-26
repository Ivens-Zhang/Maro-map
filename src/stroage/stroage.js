export function getLocalStorage(key){
    return localStorage.getItem(key)
}

export function setLocalStorage(key, value){
    localStorage.setItem(key,value)
}

export function getObjectLocalStorage(key){
    return JSON.parse(localStorage.getItem(key))
}

export function setObjectLocalStorage(key,value){
    localStorage.setItem(key, JSON.stringify(value))
}

export function removeLocalStorage(key){
    localStorage.removeItem(key)
}