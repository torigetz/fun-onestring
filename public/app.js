
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const programItemTemplate = (key, name, button) => (`
    <div class='program z-depth-1'>
        <h5 class='program__key'>${key + 1}</h5>
        <h5>${name}</h5>
        <a
            class='waves-effect waves-blue btn-flat program__run'
            id='${button}'
        >
            <i class='material-icons left'>play_circle_outline</i>
            Запустить
        </a>
    </div>
`)

const loadScript = async (name) => {
    const params = { name };
    const { data } = await axios.get('/load', { params });

    return data.code;
}

const build = async (name) => {
    const script = await loadScript(name);

    const loadedCode = document.querySelector('.loaded__code');

    const highlighted = hljs.highlight(script, { language: 'javascript' }).value;

    loadedCode.innerHTML = highlighted;
    
    $('.loaded__run').off('click');
    $('.loaded__run').on('click', () => {
        const scriptElement = document.createElement('script');
        const scriptContainer = document.querySelector('#script');

        scriptElement.innerHTML = script;

        scriptContainer.innerHTML = '';
        scriptContainer.appendChild(scriptElement);
    })

    $('.loaded').fadeIn(500);
    $('.loaded').css('display', 'flex');

    // word-wrap: break-word;
}

const loadList = async () => {
    const { data } = await axios.get('/list');

    let items = await data.map((name, key) => {
        const buttonId = `build__${name}-${key}`
        
        return {
            name,
            button: `#${buttonId}`,
            template: programItemTemplate(key, name, buttonId)
        };
    });

    await $('.programs__list').html([...items.map(item => item.template)].join('\n'));

    for (const { button, name } of items) {
        $(button).on('click', () => build(name))
    }

    $('.programs__loading').fadeOut(500);
    await sleep(500);
    $('.programs__list').fadeIn(500);
}

const main = async () => {
    loadList();
}

$(() => {
    setTimeout(() => {
        $('.app__loader').fadeOut(500);
        $('.app__main').fadeIn(500);
        setTimeout(main, 1000)
    }, 1000)
});
