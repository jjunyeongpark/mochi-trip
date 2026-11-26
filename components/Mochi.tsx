export default function Mochi({className='',variant='travel'}:{className?:string;variant?:'travel'|'small'}){
 return <svg className={className} viewBox="0 0 260 240" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="여행 가방을 든 포근트립 캐릭터">
 <ellipse cx="134" cy="219" rx="80" ry="10" fill="#CCD8BA" opacity=".35"/>
 <path d="M68 143C45 135 34 147 41 161C48 172 63 169 74 159" fill="#FFF9ED" stroke="#665647" strokeWidth="3.5"/>
 <path d="M192 141C213 126 226 139 218 153L199 169" fill="#FFF9ED" stroke="#665647" strokeWidth="3.5"/>
 <path d="M103 198L98 214C97 221 117 222 123 213L127 204M153 201L154 215C158 223 178 219 174 211L168 197" fill="#FFF9ED" stroke="#665647" strokeWidth="3.5"/>
 <path d="M59 150C59 105 82 69 129 68C178 67 202 106 204 151C209 193 184 208 135 208C86 208 55 194 59 150Z" fill="#FFFAEF" stroke="#665647" strokeWidth="4"/>
 <path d="M72 108C77 77 99 59 129 59C164 59 185 79 191 108" fill="#C2D5AF" stroke="#665647" strokeWidth="3.5"/>
 <path d="M65 108C92 97 162 96 194 108C201 110 199 117 192 117L66 117C57 117 56 111 65 108Z" fill="#B2C89E" stroke="#665647" strokeWidth="3.5"/>
 <path d="M124 59C120 46 129 37 141 44C150 49 144 58 138 60" fill="#FFE1A2" stroke="#665647" strokeWidth="3"/>
 <ellipse cx="101" cy="146" rx="4.5" ry="6" fill="#665647"/><ellipse cx="161" cy="146" rx="4.5" ry="6" fill="#665647"/>
 <ellipse cx="86" cy="157" rx="12" ry="7" fill="#F5B9B0"/><ellipse cx="175" cy="157" rx="12" ry="7" fill="#F5B9B0"/>
 <path d="M121 157C124 166 136 166 140 157" stroke="#665647" strokeWidth="3" strokeLinecap="round"/>
 {variant==='travel'&&<><path d="M90 177L111 185L108 205L87 197L68 204L72 182L90 177Z" fill="#D0E2DF" stroke="#665647" strokeWidth="2.5"/><path d="M89 178L87 197M111 185L96 191" stroke="#92B7AD" strokeWidth="2"/><rect x="183" y="170" width="47" height="43" rx="9" fill="#E8B0A5" stroke="#665647" strokeWidth="3"/><path d="M196 170V163C196 154 214 154 214 163V170M194 178V205M218 178V205" stroke="#665647" strokeWidth="3"/><rect x="201" y="185" width="12" height="10" rx="2" fill="#FFF1D4"/><circle cx="193" cy="216" r="4" fill="#665647"/><circle cx="221" cy="216" r="4" fill="#665647"/></>}
 </svg>
}
