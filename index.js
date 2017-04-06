'use strict';
(function () {

    const {Component, h, render} = window.preact;

    const
        QUAS = 'q',
        WEX = 'w',
        EXORT = 'e',
        INVOKE = 'i',

        KEY_E = 69,
        KEY_Q = 81,
        KEY_R = 82,
        KEY_W = 87;


    function randomSpell(skills) {
        const skillsList = Object.keys(skills),
            minimum = 0,
            maximum = 9,
            randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

        return skillsList[randomnumber];
    }

    function nextSpell(reagents, skills) {
        const spell = randomSpell(skills);

        if (spell !== reagents) return spell;

        return nextSpell(spell, skills);
    }

    function invokerReducer(state, action) {
        switch (action.type) {
            case 'ADD_REAGENT':
                return {
                    log: [...state.log, action.reagent],
                    reagents: [...state.reagents, action.reagent].slice(1, 4),
                    reagent: action.reagent
                };
            default:
                return state;
        }
    }

    /** Example classful component */
    class App extends Component {
        componentDidMount() {
            this.setState({message: 'Hello!'});
        }

        render(props, state) {
            return (
                h('div', {id: 'app'},
                    h(Header, {message: state.message}),
                    h(Invoker)
                )
            );
        }
    }


    /** Components can just be pure functions */
    const Header = (props) => {
        return h('header', null,
            h('h1', null, 'App'),
            props.message && h('h2', null, props.message)
        );
    };


    /** Instead of JSX, use: h(type, props, ...children) */
    class Invoker extends Component {
        constructor() {
            super();

            const defaultReagents = [QUAS, WEX, EXORT];

            this.state = {
                eduStatus: false,
                reagents: defaultReagents,
                nextSpell: defaultReagents.join(''),
                invokeLog: []
            };

            this.store = Redux.createStore(invokerReducer, {
                reagents: defaultReagents,
                reagent: '',
                log: []
            });

            this.skillKeyMap = {};
            this.skillKeyMap[KEY_E] = EXORT;
            this.skillKeyMap[KEY_Q] = QUAS;
            this.skillKeyMap[KEY_W] = WEX;
            this.skillKeyMap[KEY_R] = INVOKE;

            this.skills = {
                www: {name: 'EMP', picture: 'emp.png'},
                qww: {name: 'Tornado', picture: 'tornado.png'},
                wwe: {name: 'Alacrity', picture: 'alacrity.png'},
                qqw: {name: 'Ghost Walk', picture: 'ghost_walk.png'},
                qwe: {name: 'Deafening Blast', picture: 'deafening_blast.png'},
                wee: {name: 'Chaos Meteor', picture: 'chaos_meteor.png'},
                qqq: {name: 'Cold Snap', picture: 'cold_snap.png'},
                qqe: {name: 'Ice Wall', picture: 'ice_wall.png'},
                qee: {name: 'Forge Spirit', picture: 'forge_spirit.png'},
                eee: {name: 'Sun Strike', picture: 'sun_strike.png'},
            };

            this.startEdu = this.startEdu.bind(this);

            this._handleKey = this._handleKey.bind(this);

        }

        startEdu() {
            this.setState({eduStatus: true, nextSpell: nextSpell(this.state.reagents, this.skills)});
        }

        _handleKey(event) {
            if (event.keyCode === KEY_R) {

                const state =  {
                    invokeLog: [...this.state.invokeLog, this.store.getState().reagents],
                    nextSpell: nextSpell(this.store.getState().reagents.join(''), this.skills)
                };

                this.setState(state);


                return;
            }

            if (this.skillKeyMap.hasOwnProperty(event.keyCode)) {
                this.store.dispatch({
                    type: 'ADD_REAGENT',
                    reagent: this.skillKeyMap[event.keyCode]
                });

                return;
            }
        }


        componentWillUnmount() {
            document.removeEventListener('keydown', this._handleKey, false);
        }

        componentDidMount() {
            const port = (location.port ? ':' + location.port : ''),
                baeUrl = '//' + window.location.hostname + port + '/img/invoker/';

            // todo
            Object.keys(this.skills).forEach((skill) => (new Image()).src = baeUrl + this.skills[skill].picture);

            //
            document.addEventListener('keydown', this._handleKey, false);

            this.store.subscribe(() => {
                const state = this.store.getState();
                this.setState({reagents: state.reagents});
            })

        }

        render() {

            const reagents = this.state.reagents.map((item, id) => {
                return h('li', {id: id, class: 'reagent reagent__' + item}, item);
            });

            const log = this.state.invokeLog.map((item, id) => {
                const reagents = item.join('');

                if (!this.skills[reagents]) {
                    console.log('error');
                }

                const picture = this.skills[reagents].picture;
                const name = this.skills[reagents].name;

                return h('img', {
                    id: id,
                    width: '40',
                    height: '40',
                    src: '/img/invoker/' + picture,
                    alt: name
                }, reagents);
            });


            const data = {
                name: this.skills[this.state.nextSpell].name,
                picture: this.skills[this.state.nextSpell].picture,
                spell: this.state.nextSpell,
                spellCaste: this.state.nextSpell.toUpperCase().split('').join('-')
            };

            return (
                h('section', null,
                    h('button', {onclick: this.startEdu}, 'Начать обучение!'),

                    this.state.eduStatus && h('div', {class: 'helper'},
                        h('div', null, 'Создавай',
                            h('span', null, ' ' + data.name),
                            h('span', {class: 'helper__hilfe'}, data.spellCaste)
                        ),
                        h('div', {class: 'spell-picter'},
                            h('img', {src: '/img/invoker/' + data.picture})
                        )
                    ),

                    h('ul', {class: 'reagents'}, reagents),

                    h('div', {class: 'invoker'},
                        h('img', {src: '/img/invoker/invoker.png', alt: 'Invoker'})
                    ),

                    h('div', {class: 'skills'},
                        h('input', {class: 'skill skill__quas', type: 'button'}),
                        h('input', {class: 'skill skill__wex', type: 'button'}),
                        h('input', {class: 'skill skill__exort', type: 'button'}),
                        h('input', {class: 'skill skill__invoke', type: 'button'})
                    ),

                    h('ul', {class: 'invoke-list'}, log)
                )
            );
        }
    }


    render(h(App), document.body);
})();

