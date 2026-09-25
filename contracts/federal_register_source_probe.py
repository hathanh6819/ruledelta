# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import hashlib, json

def canon(value):return json.dumps(value,sort_keys=True,separators=(",",":"),ensure_ascii=True)
def projection(data):
    return {"document_number":str(data.get("document_number","")),"type":str(data.get("type","")),"title":str(data.get("title","")),"abstract":str(data.get("abstract", ""))[:24000],"action":str(data.get("action","")),"publication_date":str(data.get("publication_date","")),"agencies":sorted([str(x.get("slug","")).lower() for x in data.get("agencies",[]) if x.get("slug")]),"rins":sorted([str(x).upper() for x in data.get("regulation_id_numbers",[])]),"pdf_url":str(data.get("pdf_url",""))}

class FederalRegisterSourceProbe(gl.Contract):
    def __init__(self):pass
    @gl.public.write
    def probe_pair(self)->str:
        def fetch():
            values=[]
            for number in ("2023-00414","2024-09171"):
                response=gl.nondet.web.get("https://www.federalregister.gov/api/v1/documents/"+number+".json",headers={"Accept":"application/json","User-Agent":"RuleDelta/1.0 research-contact@example.org"})
                if int(response.status)!=200:return "SOURCE_UNAVAILABLE"
                data=projection(json.loads(response.body.decode("utf-8")))
                values.append({"number":number,"type":data["type"],"bytes":len(response.body),"projection_sha256":hashlib.sha256(canon(data).encode()).hexdigest(),"rin":data["rins"]})
            return canon(values)
        return gl.eq_principle.strict_eq(fetch)
    @gl.public.view
    def fixture(self)->dict:return {"proposed":"2023-00414","final":"2024-09171","rin":"3084-AB74","source":"https://www.federalregister.gov/api/v1/documents/{document_number}.json"}

Contract=FederalRegisterSourceProbe
