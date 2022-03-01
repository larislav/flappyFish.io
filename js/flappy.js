function novoElemento(tagName, className){
    const elem = document.createElement(tagName);
    elem.className = className;
    return elem;
}

function Barreira(reversa = false){
    this.elemento = novoElemento('img', 'barreira');
    if(reversa ==false)
    {
        this.elemento.src = 'imgs/aguaviva2.png';
    }
    else{
        this.elemento.src = 'imgs/aguaviva.png';
    }
    /*se reversa for true, adiciona primeiro o corpo
    se não, adiciona primeiro a borda*/
    this.setAltura = altura => this.elemento.style.height = `${altura}px`;
}

function ParDeBarreiras(altura, abertura, x){
    this.elemento = novoElemento('div', 'par-de-barreiras');
    this.superior = new Barreira(true);
    this.inferior = new Barreira(false);
    this.elemento.appendChild(this.superior.elemento);
    this.elemento.appendChild(this.inferior.elemento);
    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura);
        const alturaInferior = altura - abertura - alturaSuperior;
        this.superior.setAltura(alturaSuperior);
        this.inferior.setAltura(alturaInferior);
    }
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0]);
    this.setX = x => this.elemento.style.left = `${x}px`;
    this.getLargura = () => this.elemento.clientWidth;

    this.sortearAbertura()
    this.setX(x)
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto){
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3),
        new ParDeBarreiras(altura, abertura, largura + espaco * 4)
    ]
    var deslocamento = 4;
    var contador = 0;
    /*de quantos em quantos pixels vai ser feita a animação */
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento);
            //quando o elemento sair da área do jogo, codigo abaixo
            if(par.getX() < -par.getLargura()){
                //o x é 0 quando chega na margem esquerda do jogo
                par.setX(par.getX() + espaco * this.pares.length);
                par.sortearAbertura();
            }
            const meio = largura /2;
            //se o X do par + o deslocamento que eu acabei de dar
            //for maior ou igual ao meio, e a posição X sem 
            //o deslocamento for menor que o meio
            const cruzouMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio;
            if(cruzouMeio)
            {
                contador++;
                notificarPonto();
                if (contador > 3)
                {
                    deslocamento++;
                    contador=0;
                }
            } 
        })
    }
}

function Peixe(alturaJogo){
    let voando = false;
    this.elemento = novoElemento('img', 'peixe');
    this.elemento.src = 'imgs/peixe.png';
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0]);
    this.setY = y => this.elemento.style.bottom = `${y}px`;
    if(isMobile){
        this.elemento.style.width = "60px"; 
        window.ontouchstart = function(e){
            voando = true
            document.querySelector('.peixe').style.transform = 'rotate( ' + -5 + 'deg )'        
        } 
        window.ontouchend = function(e){
            voando = false
            document.querySelector('.peixe').style.transform = 'rotate( ' + 5 + 'deg )'
        }
    }
    else{
        window.onkeydown = function(e){
            voando = true
            document.querySelector('.peixe').style.transform = 'rotate( ' + -5 + 'deg )'        
        } 
        window.onkeyup = function(e){
            voando = false
            document.querySelector('.peixe').style.transform = 'rotate( ' + 5 + 'deg )'
        } 
    }
    
    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -3)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight
        if(novoY <= 0){
            this.setY(0);
        }
        else if (novoY >= alturaMaxima){
            this.setY(alturaMaxima);
        }
        else{
            
            this.setY(novoY);
        }
    }
    this.setY(alturaJogo / 2);
}

function Progresso(){
    this.elemento = novoElemento('span', 'progresso');
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    //a.left = lado esquerdo do elemento A
    //mais a largura dele = lado direito
    //se o lado esquerdo do B. colisao

    //lado direito de B mais a largura dele
    //é maior que o lado esquerdo de A
    const horizontal = a.left-8 + a.width-8 >= b.left-8
        && b.left-8 + b.width-8 >= a.left-8
    const vertical = a.top-8 + a.height-8 >= b.top-8
        && b.top-8 + b.height-8 >= a.top-8
    return horizontal && vertical
}

function colidiu(peixe, barreiras){
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras =>{
        if(!colidiu){
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(peixe.elemento, superior) 
            || estaoSobrepostos(peixe.elemento, inferior)
        }
    })
    return colidiu
}

function FlappyFish(){
    let pontos = 0
    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 250,
        () => progresso.atualizarPontos(++pontos))
        const peixe = new Peixe(altura)
        areaDoJogo.appendChild(progresso.elemento)
        areaDoJogo.appendChild(peixe.elemento)
        barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

        this.start = () => {
            const temporizador = setInterval (() => {
                barreiras.animar()
                peixe.animar()
                if (colidiu(peixe, barreiras)){
                    clearInterval(temporizador)
                    let placar = novoElemento('div', 'placarFinal');
                    placar.innerHTML = `Placar final: ${pontos}`;
                    areaDoJogo.appendChild(placar);
                    if(isMobile){
                        $(document).one('touchend', function(e) {
                            $('div[wm-flappy]').empty();
                            new FlappyFish().start()
                        });
                    }
                    else{
                        $(document).one('keydown', function(e) {
                            $('div[wm-flappy]').empty();
                            new FlappyFish().start()
                        });
                    }
                }
            }, 20)
        }
}
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

$(document).ready(function(e){
    let inicio = novoElemento('div', 'fraseInicio');
    inicio.innerHTML = `pressione qualquer tecla`;
    document.querySelector('[wm-flappy]').appendChild(inicio);
})
if(isMobile){
    $(document).one('touchend', function(e) {
        $('div[wm-flappy]').empty();
        new FlappyFish().start()
    }) 
}
else{
    $(document).one('keyup', function(e) {
        $('div[wm-flappy]').empty();
        new FlappyFish().start()
    }) 
}

