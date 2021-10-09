
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const router = () => {
    const getInitialRoute = () => {
        const route = location.hash.replace('#', '');

        let routeSelector = `#route__${route}`;
        
        const findedRoutes = document.querySelectorAll(routeSelector)

        if (findedRoutes.length !== 1) {
            routeSelector = `#route__examples`;
        }

        return routeSelector;
    }

    const navigate = async (route) => {
        const routeSelector = `#route__${route}`;

        for (let element of document.querySelectorAll('.app__view')) {
            $(element).fadeOut(500);
        }

        await sleep(500);

        $(routeSelector).fadeIn(500);
    }

    const start = () => {
        const navigatorItems = document.querySelectorAll('#navigator li a');

        [...navigatorItems].forEach(item => {
            $(item).on('click', () => {
                const route = item.href.split('#').pop();

                navigate(route);
            });
        })
    }

    return { getInitialRoute, navigate, start };
}

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

const createContainer = (code) => {
    const containerId = uuid.v4().replaceAll('-', '');
    const containerName = `code_${containerId}`;

    const layout = `
        window.${containerName} = () => {
            try {
                ${code}
            } catch (e) {
                console.error(e);
            } finally {
                finishCode('${containerName}');
            }
        }

        window.${containerName}();
    `;
    
    return { containerName, layout };
}

const loadScript = async (name) => {
    const params = { name };
    const { data } = await axios.get('/load', { params });

    return data.code;
}

const runCode = (code) => {
    const { containerName, layout } = createContainer(code);

    const scriptElement = document.createElement('script');
    const scriptContainer = document.querySelector('#script');
    
    scriptElement.innerHTML = layout;
    scriptContainer.innerHTML = '';

    scriptContainer.append(scriptElement);
}

const finishCode = (containerName) => {
    delete window[containerName];

    const scriptContainer = document.querySelector('#script');
    scriptContainer.innerHTML = '';
}

const build = async (name) => {
    const script = await loadScript(name);

    const loadedCode = document.querySelector('.loaded__code');

    const highlighted = hljs.highlight(script, { language: 'javascript' }).value;

    loadedCode.innerHTML = highlighted;
    
    $('.loaded__run').off('click');
    $('.loaded__run').on('click', () => {
        runCode(script);
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

const compile = async (code) => {
    const { data } = await axios.post('/compile', { code });

    return data.code;
}

const encode = (content) => `data:text/javascript;charset=utf-8,${content}`;

const saveSnippet = (name, content) => {
    const downloadContainer = document.querySelector('#download');

    const filename = `${name}.js`;
    const encoded = encode(content);

    const downloader = document.createElement('a');
    downloader.style.display = 'none';
    downloader.setAttribute('href', encoded);
    downloader.setAttribute('download', filename);

    downloadContainer.appendChild(downloader);

    downloader.click();
}

const CACHE_ITEM = 'snippet/cache';

const loadCache = () => {
    const cache = localStorage.getItem(CACHE_ITEM) || 'null';
    return JSON.parse(cache);
}

const saveCache = (cache) => {
    const stringified = JSON.stringify(cache);
    localStorage.setItem(CACHE_ITEM, stringified);
}

const clearCache = () => {
    localStorage.removeItem(CACHE_ITEM);
}

const setControlsState = (disabled) => {
    const controls = document.querySelectorAll('.playground__controls a')
    let method = disabled ? 'add' : 'remove';

    controls.forEach(control => {
        control.classList[method]('control-disabled');
    });

    const cache = loadCache();

    if (!cache) {
        $('#playground__clear').css('display', 'none');
    } else {
        $('#playground__clear').css('display', 'block');
    }
}

const startPlayground = async () => {
    const editor = ace.edit('playground__code');
    editor.session.setMode("ace/mode/javascript");

    const cache = loadCache();
    console.log(cache)
    if (cache) {
        editor.setValue(cache.code);
        $('#playground__name').val(cache.name);
        M.updateTextFields();
    }

    let debounceEvent;

    const getSnippetName = () => $('#playground__name').val();
    let compressed;

    const isDisabled = () => {
        if (!compressed || !getSnippetName()) {
            return true;
        }
        
        return false;
    }
    

    editor.session.on('change', () => {
        setControlsState(true);

        $('#playground__result').css('display', 'none');
        $('.playground__loader').css('display', 'flex')

        debounceEvent && clearTimeout(debounceEvent);

        debounceEvent = setTimeout(async () => {
            const code = editor.session.getValue();

            const compiled = await compile(code);

            console.log(compiled);
            
            compressed = compiled !== 'null' ? compiled : '';
            $('#playground__result').html(
                `<pre>${hljs.highlight(compressed, { language: 'javascript' }).value}</pre>`
            );

            const disabled = isDisabled();

            setControlsState(disabled);

            saveCache({
                code,
                name: getSnippetName()
            });
            $('.playground__loader').css('display', 'none');
            $('#playground__result').css('display', 'flex');
        }, 1000);
    });

    $('#playground__run').on('click', () => {
        runCode(compressed);
    })

    $('#playground__save').on('click', () => {
        saveSnippet(
            getSnippetName(),
            compressed
        );
    })

    $('#playground__clear').on('click', () => {
        $('#playground__name').val('');
        editor.setValue('');
        clearCache();
    })
}

const main = async () => {
    router().start();

    const routeElement = router().getInitialRoute();

    $(routeElement).fadeIn(500);

    loadList();
    startPlayground();
};

$(() => {
    setTimeout(() => {
        $('.app__loader').fadeOut(500);
        $('.app__main').fadeIn(500);
        setTimeout(main, 1000)
    }, 1000)
});
