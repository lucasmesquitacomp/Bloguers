( function(){
	var app = angular.module('app',['ui.mask','ui.router']);

	app.config(function ($stateProvider, $urlRouterProvider){
		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl:'/templates/home.html'
			})
			.state('consulta',{
				url: '/consulta',
				templateUrl:'/templates/consulta.html'
			})
			.state('lista',{
				url: '/lista',
				templateUrl: '/templates/lista.html'
			})
			.state('envios',{
				url: '/envios',
				templateUrl: '/templates/envios.html'

			})

			;
	})


	function CorreiosFactory($http,$q){
	
		var Correios = {
			endpoint:'http://cep.correiocontrol.com.br/'
		}

		
		Correios.getAddress = function(cep){
			return $http.get(Correios.endpoint + cep + '.json')
		.then(function (searchRes){
			
			console.log(searchRes)	
			return searchRes.data;

		})
		}
		
	return Correios;
	}

	function InstagramFactory($http,ACCESS_TOKEN,$q){

		var date = new Date();
		var unixTime = Math.round((date.getTime()/1000)) - (48*60*60);

		var Instagram = {
			endpoint:'https://api.instagram.com/v1'
		}

		function verifyResponse(res){
			if (res.data.length < 1) {
				return $q.reject(res);
			} else {
				return res;
			}
		}

		function transformResponse (res) {
			var data = res.data;

			if(data.meta.code !== 200){
				return $q.reject(data);
			} else {
				return data.data;
			}
	  }

	  Instagram.getUserByName = function (userName){
	  	return $http.jsonp(Instagram.endpoint + '/users/search',{
	  	params:{
	  		callback : 'JSON_CALLBACK',
	  		access_token: ACCESS_TOKEN,
	  		q: userName
	  	}
	  	}).then(verifyResponse).then(function (searchRes){
	  	return searchRes;
	  	}
	  	);
	  }
	  
	  Instagram.getUserData = function (userId) {
	    return $http.jsonp(Instagram.endpoint + '/users/'+ userId +'/',{
	    	params:{
	    		callback: 'JSON_CALLBACK',
	    		access_token: ACCESS_TOKEN
	    	}
	    })
	    .then(transformResponse);
	  }

	  Instagram.getUserMedia = function (userId){
			return $http.jsonp(Instagram.endpoint + '/users/'+ userId + '/media/recent/',{
				params:{
					callback: 'JSON_CALLBACK',
					access_token: ACCESS_TOKEN,
					count: 4,
					max_timestamp: unixTime
				}
			}).then(transformResponse).then(function (data) {
				
				return data;
			});
	  }
	  return Instagram;
		}


		app.constant('ACCESS_TOKEN','2079269339.2140983.8b18645498c94f32b7f7227523712a18');
		
		app.factory('Instagram', InstagramFactory);
		app.factory('Correios', CorreiosFactory);
		
		app.service("comm", function Bloguers($http){
			var self = this;
			self.bloguer = {};
			self.bloguers =[];
			this.listBloguers = function (){
				return $http.get('/api/bloguers').then(function (data){
					angular.extend(self.bloguers, data.data);
					return self.bloguers;
				});
			}			
		})


		app.controller('ConsultController',function (comm,Correios,Instagram,$http,$scope,$q,$state){
			var self = this;
			self.bloguer = comm.bloguer;
			
			comm.listBloguers().then(function(data){
				self.bloguers = data;
			})
			this.getUserByName = function(userName){
				var searchRes 
				Instagram.getUserByName(userName).then(function (res){
					searchRes =/*possivel função de verificação*/ res.data.data[0];
					return $q.all([Instagram.getUserData(searchRes.id), Instagram.getUserMedia(searchRes.id)])																																										}).then(function (promises) {
					//promises[0] = primie resultada da get user data-> objeto simples
					}).then(function (promises) {
					
					self.bloguer.username = promises[0].username;
					self.bloguer.id = promises[0].id;
					self.bloguer.full_name = promises[0].full_name;
					self.bloguer.followed_by = promises[0].counts.followed_by;
					
					var mediaLike = 0;
					var mediaComm = 0;
					
					promises[1].forEach ( function(obj){
						mediaLike += Number(obj.likes.count);
						mediaComm += Number(obj.comments.count);

					});

					self.bloguer.mediaLikes = Math.round(mediaLike/promises[1].length);
					self.bloguer.mediaComments = Math.round(mediaComm/promises[1].length); 
				
				}, function (err) {
					console.log(err);
				});
			};

			this.checkCep = function(cep){
				Correios.getAddress(cep).then(function (res){
					self.bloguer.endereco = res.logradouro + ', ' + res.bairro + ', ' + res.localidade + ', ' + res.uf

				}, function (err) {
					self.bloguer.endereco = '';
					console.log(err);
				})
			}

			this.saveBloguer = function(bloguer){
				$http.post('/api/bloguers', bloguer).then(function (){
				  console.log(bloguer);
				} )				
				bloguers.bloguer = {};
				self.bloguer = {};
				self.userName = '';
			}
		})
		
		app.controller("ListController",function (comm,Instagram,$http,$scope,$q,$state,$interval){
			var self = this;
			self.bloguer = comm.bloguer;
			
			comm.listBloguers().then(function(data){
				self.bloguers = data;
			})

			this.getBloguer = function (id){
				return $http.get('/api/bloguers/' + id)
			}

			this.deleteBloguer = function(id){
				$http.delete('/api/bloguers/' + id).then(function (){

				})
			}

			this.editBloguer = function(id){
				self.getBloguer(id).then(function (data){
					bloguers.bloguer= data.data;
					$state.go('consulta');

				})
			}
		})

		app.controller("EnvioController", function ($scope,$q,$state,$http,comm){
			var self = this;
			self.bloguer = comm.bloguer; 
			self.envios = [];
			self.envio = {};


			comm.listBloguers().then(function(data){
				self.bloguers = data;
			})

			this.listEnvios = function (){
				$http.get('/api/envios').then(function (data){
					self.envios = data;
				})
			}
						
			

			this.addEnvio = function (envio){
				console.log(envio);
				$http.post('/api/envios', envio).then(function (){
				  console.log(envio);
				} )				
				self.envio = {};
			}
			
			this.delEnvio = function (){

			}
			this.refreshEnvios = function (){

			}	
			

		})
})();