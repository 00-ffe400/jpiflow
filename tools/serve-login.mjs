import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const port=Number(process.env.PORT||process.argv[2]||4173);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.txt':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/'){res.writeHead(302,{Location:'/login/'});res.end();return;}
    let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
    const relative=path.relative(root,file);
    if(relative.startsWith('..')||path.isAbsolute(relative)){res.writeHead(403);res.end();return;}
    if((await stat(file)).isDirectory()){
      if(!url.pathname.endsWith('/')){res.writeHead(302,{Location:url.pathname+'/'+url.search});res.end();return;}
      file=path.join(file,'index.html');
    }
    const data=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(data);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Login preview: http://127.0.0.1:${port}/login/`));
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
