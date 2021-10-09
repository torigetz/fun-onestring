
const main = async () => {
}

$(() => {
    setTimeout(async () => {
        await $('.app__loader').fadeOut(500);
        await $('.app__main').fadeIn(500);
        main();
    }, 1000)
});
