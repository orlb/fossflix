" Project-specific vim macros and mappings. Spent a little while on this. Pretty cool
" Works with this two-liner in vimrc, searches directory tree for '.macros.vim' file :
"
" let vim_macros = system('x=`pwd`; while [ "$x" != "/" ] ; do find "$x" -maxdepth 1 -name .macros.vim -print -quit; x=`dirname "$x"`; done')
" execute ":source ".vim_macros

" Key combo '@ 1' will run lua on main.lua file
nnoremap @1 :tabnew<cr>:term lua main.lua<cr>

" And so on...
