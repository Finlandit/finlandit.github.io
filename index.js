const introductionMdElem = document.querySelector('#introduction-md');
const furthermoreMdElem = document.querySelector('#furthermore-md');

fetch('introduction.md')
    .then(response => response.text())
    .then(markdown => {
        introductionMdElem.innerHTML = marked.parse(markdown);
    })
    .catch(error => {
        console.error('Error:', error);
    });

fetch('furthermore.md')
    .then(response => response.text())
    .then(markdown => {
        furthermoreMdElem.innerHTML = marked.parse(markdown);
    })
    .catch(error => {
        console.error('Error:', error);
    });