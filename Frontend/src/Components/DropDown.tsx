type DropDownItems={
    label:string,
    onClick?:()=>void    
}
type DropDownProps={
 label: React.ReactNode;
  items: DropDownItems[];
  align?: "start" | "end";
}


export function DropDown({label,align,items}:DropDownProps){
    return(
         <div className={`dropdown dropdown-${align} `}>

            <div tabIndex={0} role="button" className="btn m-1 bg-black text-white">
               {label}
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-black rounded-box z-1 w-52 p-2 shadow-sm text-white">
            {
                items.map((item,index)=>(
                    <li key={index}>
                        <button onClick={item.onClick}>{item.label}</button>
                    </li>
                ))
            }
            </ul>
            </div>
    )
}