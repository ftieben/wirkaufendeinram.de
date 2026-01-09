const y=["Corsair","G.Skill","Kingston","Crucial","Samsung","SK Hynix","Micron","ADATA","Team","Patriot","HyperX","Mushkin","GeIL"],g={DDR3:{min:800,max:2133},DDR4:{min:1600,max:3200},DDR5:{min:3200,max:6400}},h=[1,2,4,8,16,32,64,128];function x(e){const t=[];if(e.type?["DDR3","DDR4","DDR5"].includes(e.type)||t.push({field:"type",message:"RAM type must be DDR3, DDR4, or DDR5"}):t.push({field:"type",message:"RAM type is required"}),e.capacity?!Number.isInteger(e.capacity)||e.capacity<=0?t.push({field:"capacity",message:"Capacity must be a positive integer"}):h.includes(e.capacity)||t.push({field:"capacity",message:`Capacity must be one of: ${h.join(", ")} GB`}):t.push({field:"capacity",message:"Capacity is required"}),!e.speed)t.push({field:"speed",message:"Speed is required"});else if(!Number.isInteger(e.speed)||e.speed<=0)t.push({field:"speed",message:"Speed must be a positive integer"});else if(e.type&&g[e.type]){const i=g[e.type];(e.speed<i.min||e.speed>i.max)&&t.push({field:"speed",message:`Speed for ${e.type} must be between ${i.min} and ${i.max} MHz`})}return e.brand?typeof e.brand!="string"||e.brand.trim().length===0?t.push({field:"brand",message:"Brand must be a non-empty string"}):y.includes(e.brand)||t.push({field:"brand",message:`Unknown brand. Known brands: ${y.join(", ")}`}):t.push({field:"brand",message:"Brand is required"}),e.condition?["new","excellent","good","fair"].includes(e.condition)||t.push({field:"condition",message:"Condition must be new, excellent, good, or fair"}):t.push({field:"condition",message:"Condition is required"}),e.quantity?!Number.isInteger(e.quantity)||e.quantity<=0?t.push({field:"quantity",message:"Quantity must be a positive integer"}):e.quantity>100&&t.push({field:"quantity",message:"Quantity cannot exceed 100 modules"}):t.push({field:"quantity",message:"Quantity is required"}),{isValid:t.length===0,errors:t}}function M(e){const t=[];if(e.name?typeof e.name!="string"||e.name.trim().length===0?t.push({field:"name",message:"Name must be a non-empty string"}):e.name.trim().length<2&&t.push({field:"name",message:"Name must be at least 2 characters long"}):t.push({field:"name",message:"Name is required"}),e.email?typeof e.email!="string"?t.push({field:"email",message:"Email must be a string"}):/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email)||t.push({field:"email",message:"Email format is invalid"}):t.push({field:"email",message:"Email is required"}),!e.phone)t.push({field:"phone",message:"Phone number is required"});else if(typeof e.phone!="string")t.push({field:"phone",message:"Phone number must be a string"});else{const i=e.phone.replace(/[\s\-\(\)\+]/g,"");/^\d{10,15}$/.test(i)||t.push({field:"phone",message:"Phone number must contain 10-15 digits"})}return e.preferredContact?["email","phone","either"].includes(e.preferredContact)||t.push({field:"preferredContact",message:"Preferred contact must be email, phone, or either"}):t.push({field:"preferredContact",message:"Preferred contact method is required"}),e.location?typeof e.location!="string"||e.location.trim().length===0?t.push({field:"location",message:"Location must be a non-empty string"}):e.location.trim().length<2&&t.push({field:"location",message:"Location must be at least 2 characters long"}):t.push({field:"location",message:"Location is required"}),{isValid:t.length===0,errors:t}}const q={DDR3:{basePricePerGB:8,speedMultipliers:{800:.7,1066:.8,1333:.9,1600:1,1866:1.1,2133:1.2}},DDR4:{basePricePerGB:12,speedMultipliers:{1600:.7,2133:.8,2400:.9,2666:1,2933:1.1,3200:1.2}},DDR5:{basePricePerGB:18,speedMultipliers:{3200:.8,4800:.9,5600:1,6e3:1.1,6400:1.2}}},S={Corsair:1.15,"G.Skill":1.12,Kingston:1.05,Crucial:1.08,Samsung:1.2,"SK Hynix":1.1,Micron:1.08,ADATA:.95,Team:.9,Patriot:.92,HyperX:1.1,Mushkin:.95,GeIL:.88},I={new:1,excellent:.85,good:.7,fair:.5},A={demandMultiplier:1.25,supplyMultiplier:.95,seasonalMultiplier:1.05},D={1:.8,2:.9,4:1,8:1.05,16:1.1,32:1.15,64:1.2,128:1.25};function C(e,t){const i=q[e].speedMultipliers,n=Object.keys(i).map(Number).sort((r,l)=>r-l);let o=n[0],a=Math.abs(t-o);for(const r of n){const l=Math.abs(t-r);l<a&&(a=l,o=r)}return i[o]}function P(e){const i=q[e.type].basePricePerGB,n=C(e.type,e.speed),o=S[e.brand]||1,a=I[e.condition],r=D[e.capacity]||1;return i*e.capacity*n*o*a*r}function B(e){const{demandMultiplier:t,supplyMultiplier:i,seasonalMultiplier:n}=A;return e*t*i*n}function $(e){const i=Math.max(0,e*.85),n=e*(1+.15);return{min:Math.round(i*100)/100,max:Math.round(n*100)/100}}function k(e){const t=[];t.push(`${e.type} base pricing applied`);const i=C(e.type,e.speed);i>1?t.push(`High speed (${e.speed}MHz) premium applied`):i<1&&t.push(`Lower speed (${e.speed}MHz) discount applied`);const n=S[e.brand]||1;n>1?t.push(`Premium brand (${e.brand}) bonus applied`):n<1&&t.push(`Budget brand (${e.brand}) adjustment applied`),e.condition!=="new"&&t.push(`Used condition (${e.condition}) adjustment applied`);const o=D[e.capacity]||1;return o>1?t.push(`High capacity (${e.capacity}GB) premium applied`):o<1&&t.push(`Low capacity (${e.capacity}GB) discount applied`),t.push("Current market demand adjustment applied"),e.quantity>1&&t.push(`Bulk quantity (${e.quantity} modules) considered`),t}function T(e){const t=P(e),n=B(t)*e.quantity;return Math.round(n*100)/100}function L(e){const t=T(e),i=$(t),n=k(e);let o;return e.quantity===1?o="Response within 2-4 hours":e.quantity<=5?o="Response within 4-8 hours":o="Response within 8-24 hours for bulk evaluation",{estimatedValue:t,priceRange:i,factors:n,timeline:o,nextSteps:["Our team will review your RAM specifications","We will verify current market conditions","You will receive a formal purchase offer","Upon acceptance, we will arrange pickup or shipping"]}}const s=document.getElementById("ram-evaluation-form"),c=document.getElementById("loading-state"),d=document.getElementById("quote-results"),b=document.getElementById("clear-form"),v=document.getElementById("new-quote"),E=document.getElementById("accept-quote");let u=null;function N(){if(!s)return;s.querySelectorAll("input, select").forEach(t=>{t.addEventListener("blur",()=>Q(t)),t.addEventListener("input",()=>f(t))})}function Q(e){const t=e.name;f(e);const i=m();if(i){if(["type","capacity","speed","brand","condition","quantity"].includes(t)){const o=x(i.ramSpec).errors.find(a=>a.field===t);o&&p(e,o.message)}else if(["name","email","phone","preferredContact","location"].includes(t)){const o=M(i.contact).errors.find(a=>a.field===t);o&&p(e,o.message)}}}function p(e,t){e.classList.add("error");const i=document.getElementById(`${e.name}-error`);i&&(i.textContent=t)}function f(e){e.classList.remove("error");const t=document.getElementById(`${e.name}-error`);t&&(t.textContent="")}function R(){if(!s)return;s.querySelectorAll("input, select").forEach(t=>f(t))}function m(){if(!s)return null;const e=new FormData(s),t=a=>{const r=e.get(a);return typeof r=="string"?r:""},i=a=>{const r=t(a),l=parseInt(r,10);return isNaN(l)?0:l},n={type:t("type")||void 0,capacity:i("capacity")||void 0,speed:i("speed")||void 0,brand:t("brand")||void 0,condition:t("condition")||void 0,quantity:i("quantity")||void 0},o={name:t("name")||void 0,email:t("email")||void 0,phone:t("phone")||void 0,preferredContact:t("preferredContact")||void 0,location:t("location")||void 0};return{ramSpec:n,contact:o}}function G(){const e=m();if(!e)return!1;const{ramSpec:t,contact:i}=e,n=x(t),o=M(i);return n.errors.forEach(a=>{if(!s)return;const r=s.querySelector(`[name="${a.field}"]`);r&&p(r,a.message)}),o.errors.forEach(a=>{if(!s)return;const r=s.querySelector(`[name="${a.field}"]`);r&&p(r,a.message)}),n.isValid&&o.isValid}function V(e){const t=document.getElementById("quote-value"),i=document.getElementById("quote-range"),n=document.getElementById("quote-timeline"),o=document.getElementById("quote-factors"),a=document.getElementById("quote-next-steps");t&&(t.textContent=`$${e.estimatedValue.toFixed(2)}`),i&&(i.textContent=`$${e.priceRange.min.toFixed(2)} - $${e.priceRange.max.toFixed(2)}`),n&&(n.textContent=e.timeline),o&&(o.innerHTML="",e.factors.forEach(r=>{const l=document.createElement("li");l.textContent=r,o.appendChild(l)})),a&&(a.innerHTML="",e.nextSteps.forEach(r=>{const l=document.createElement("li");l.textContent=r,a.appendChild(l)})),d&&(d.style.display="block",d.style.opacity="0",d.style.transform="translateY(20px)",setTimeout(()=>{d.style.transition="opacity 0.5s ease, transform 0.5s ease",d.style.opacity="1",d.style.transform="translateY(0)"},100),d.scrollIntoView({behavior:"smooth"})),H()}function H(){const e=document.createElement("div");e.innerHTML=`
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #38a169;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 999;
        font-weight: 500;
      ">
        ✓ Quote generated successfully!
      </div>
    `,document.body.appendChild(e),setTimeout(()=>{e.parentNode&&e.parentNode.removeChild(e)},3e3)}async function j(e){if(e.preventDefault(),R(),!!G()){c&&(c.style.display="block"),d&&(d.style.display="none");try{const t=m();if(!t)throw new Error("Unable to get form data");const{ramSpec:i}=t;if(!i.type||!i.capacity||!i.speed||!i.brand||!i.condition||!i.quantity)throw new Error("Incomplete RAM specification");await new Promise(a=>setTimeout(a,1500));const n={type:i.type,capacity:i.capacity,speed:i.speed,brand:i.brand,condition:i.condition,quantity:i.quantity},o=L(n);u=o,c&&(c.style.display="none"),V(o)}catch(t){console.error("Error generating quote:",t),c&&(c.style.display="none"),alert("Sorry, there was an error generating your quote. Please try again.")}}}function F(){s&&(s.reset(),R(),d&&(d.style.display="none"),u=null)}function _(){d&&(d.style.display="none"),u=null,s&&s.scrollIntoView({behavior:"smooth"})}function z(){if(u){const e=m();if(e&&e.contact.preferredContact){const t=e.contact.preferredContact,i=e.contact;let n="Thank you for accepting our quote! ";switch(t){case"email":n+=`We will contact you via email at ${i.email} within the timeframe specified in your quote.`;break;case"phone":n+=`We will contact you via phone at ${i.phone} within the timeframe specified in your quote.`;break;case"either":n+=`We will contact you via email (${i.email}) or phone (${i.phone}) within the timeframe specified in your quote.`;break;default:n+="We will contact you soon to finalize the purchase."}U(n,u.timeline)}else alert("Thank you! We will contact you soon to finalize the purchase.");K()}}function U(e,t){const i=`
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      " id="quote-confirmation-overlay">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 8px;
          max-width: 500px;
          margin: 1rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        ">
          <h3 style="color: #38a169; margin-bottom: 1rem; text-align: center;">
            ✓ Quote Accepted Successfully!
          </h3>
          <p style="margin-bottom: 1rem; line-height: 1.5;">
            ${e}
          </p>
          <div style="
            background: #f7fafc;
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 1rem;
            border-left: 4px solid #38a169;
          ">
            <strong>Expected Response Time:</strong> ${t}
          </div>
          <div style="text-align: center;">
            <button onclick="closeQuoteConfirmation()" style="
              background: #3182ce;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 4px;
              cursor: pointer;
              font-weight: 500;
            ">
              Close
            </button>
          </div>
        </div>
      </div>
    `;document.body.insertAdjacentHTML("beforeend",i),window.closeQuoteConfirmation=()=>{const n=document.getElementById("quote-confirmation-overlay");n&&n.remove(),delete window.closeQuoteConfirmation}}function K(){console.log("Quote submission simulated:",{quote:u,timestamp:new Date().toISOString(),contactInfo:m()?.contact})}function w(){N(),s&&s.addEventListener("submit",j),b&&b.addEventListener("click",F),v&&v.addEventListener("click",_),E&&E.addEventListener("click",z)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",w):w();
