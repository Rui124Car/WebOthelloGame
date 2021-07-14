all: deploy

# deploy-server:
# 	ssh up201805046@twserver.alunos.dcc.fc.up.pt 'mkdir -p public_html/server/';
# 	scp /home/rui/3ano/tecweb/TW/server/*.js /home/rui/3ano/tecweb/TW/server/package.json up201805046@twserver.alunos.dcc.fc.up.pt:/net/areas/homes/up201805046/public_html/server/;
# 	# ssh up201805046@twserver.alunos.dcc.fc.up.pt 'cd public_html/server/; npm i';
# 	# ssh up201805046@twserver.alunos.dcc.fc.up.pt 'cd public_html/server/; npm start >> ../server.log &';

# deploy-frontend:
# 	ssh up201805046@twserver.alunos.dcc.fc.up.pt 'mkdir -p public_html/frontend/';
# 	scp -r /home/rui/3ano/tecweb/TW/frontend/* up201805046@twserver.alunos.dcc.fc.up.pt:/net/areas/homes/up201805046/public_html/frontend/;
# 	# ssh up201805046@twserver.alunos.dcc.fc.up.pt 'cd public_html/frontend/; npm i';
# 	# ssh up201805046@twserver.alunos.dcc.fc.up.pt 'cd public_html/frontend/; npm start >> ../frontend.log &';

# deploy: deploy-server deploy-frontend

deploy:
	scp -r assets server index.html index.js package.json up201805397@twserver.alunos.dcc.fc.up.pt:/net/areas/homes/up201805397/public_html/;
