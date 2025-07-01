//task 2, 3
let button = document.getElementById("my-button")
button.addEventListener("click", function(){
    console.log("hello world")
    let text = document.getElementById("text")
    text.innerHTML = "Moi maailma"
})

// task 4

let secondButton = document.getElementById("add-data")
secondButton.addEventListener("click", function(){
    // Get value from the text area
    let message = document.getElementById("message").value
    

    //Create an new item
    let newData = document.createElement("li")
    newData.innerHTML = message

    // Add an new item to list
    let list = document.getElementById("my-list")
    list.appendChild(newData)




})

