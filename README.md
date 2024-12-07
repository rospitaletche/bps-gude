# Github Pages

1) vite.config.js:

  base: '/bps-gude/',
  build: {
    outDir: 'docs', // Si estás usando 'docs' para GitHub Pages
  },

2) npm run build
3) Realizar el push para que se suba la carpeta 'docs'
4) En github seleccionar Page, seleccionar main > docs 
5) Save











Necesito que me ayudes a crear un sitio backend en Nest.js con postgresql, cuyo objetivo es guardar la información de acciones del mercado. 
Para ello voy a manejarme con una API: BRAPI, que contiene distinatas accciones.
Al inicio trabajare con la BD directametne en mi localhost. Pero luego, cuando este todo pronto, lo pasare a heroku. Por lo tanto, mas adelante te pedire ayuda paraa hacerlo.
Ye explico porque no trabajo directamente con BRAPI. 
Uno de los motivos es que quiero tener toda la informacion a mi alcance, sin limitaciones. Por lo menos todo lo que sea historico. Luego me ocupare de la información en tiempo real, que podré conseguirla directamete de BRAPI o de otro servicio. ]
Otro tema, y quizas el mas importante, es que estaba teniendo un par de problemas al tratar de realizar una estrategia con la forma con la cual BRAPI me permitia acceder a los datos. Por ejemplo, para acceder a ciertos datos de una accion, tenia que mandar la siguiente informacion:
'''
Parâmetro	Valor
tickers	PETR4,^BVSP
range	5d
interval	1d
'''
Esto me devolveria los datos de las acciones, en los ultimos 5d, por día.
Muchas veces, cuando quiero trabajar con un backtesting de cierta estrategia, lo ideal para mi seria tener una BD con toda la información y poder pedir, por ejemplo, la información de un día x (ej. 01/10/2024) y la información de los ultimos días anteriores a esa fecha.
Creo que contando con los datos en mi BD, esto sera mas facil de realizar.
Siendo asi, lo que pretendo es tener mi base de datos con la mayor cantidad de datos posible. Traer toda la información que pueda tener de BRAPI y alojarla en mi BD. 
Para eso, tengo que tener en cuenta que BRAPI me puede brindar la siguiente información:
'''
Para los ultimos 7 días: 1m, 2m, 5m, 15m, 30m, 60m, 90m e 1h
Hasta 10 anios: 1d, 5d, 1wk 
mais de 10 anos: 1mo, 3mo
'''
Siendo asi, voy a guardar en mi BD:
'''
La info de cada 1m, para los ultimos 7 días.
La info de cada 1d, para los ultimos 10 anios.
'''
Luego buscare la forma de actualizar, dia a día, con la información minuto a minuto.

Tambien pretendo que mi BD tenga otro tipo de información, propia de las acciones, como ser dividendos y otras cosas que guarda BRAPI. 
Pero en principio me parece que con los precios de las acciones andaría bien.

Te voy a pasar endpoints y sus respuestas para que vayas viendo como podemos instrumentar la BD. 
Te pido que me expliques paso a paso como hacerlo. Soy bastante nuevo con esto.
Quiero que el backend este bien implementado, con todo separado: dtos, interfaces, entidades, etc.

Voy a empezar pasandote algunos endpoints que tengo de BRAPI con sus respuestas, para que me ayudes a pasarlo a BD y codigo.

'''
# 
'''


