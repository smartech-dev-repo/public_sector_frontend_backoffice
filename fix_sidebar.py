import re
import sys

def main():
    path = '/Users/marquis/public-sector/admin/app/dashboard/layout.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # 1. Fix logout button
    content = content.replace(
        'className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group"',
        'className={`relative flex items-center gap-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group ${isSidebarMinimized ? \'justify-center px-2\' : \'px-4\'}`}'
    )
    
    # Replace logout title tooltip
    content = content.replace(
        'title={isSidebarMinimized ? \'Logout\' : \'\'}\n          >',
        '>\n            {isSidebarMinimized && (\n              <div className="hidden group-hover:block absolute left-14 bg-slate-800 text-white text-[11px] px-2 py-1 rounded shadow-md whitespace-nowrap z-50">\n                Logout\n              </div>\n            )}'
    )

    # 2. Fix group buttons padding and add tooltip
    def replace_group_btn(match):
        group_id = match.group(1)
        cls_prefix = match.group(2)
        cls_suffix = match.group(3)
        title = match.group(4)
        inner = match.group(5)
        
        # fix the classes: add relative, remove hardcoded justify-between px-4, use conditional
        # the original class had "justify-between px-4" inside cls_prefix
        new_cls_prefix = cls_prefix.replace('justify-between ', '')
        
        return f"""<button
                onClick={{() => !isSidebarMinimized && toggleGroup('{group_id}')}}
                className={{`relative ${{isSidebarMinimized ? 'justify-center px-2' : 'justify-between px-4'}} {new_cls_prefix}{cls_suffix} group`}}
              >
{inner}
                {{isSidebarMinimized && (
                  <div className="hidden group-hover:block absolute left-14 bg-slate-800 text-white text-[11px] px-2 py-1 rounded shadow-md whitespace-nowrap z-50">
                    {title}
                  </div>
                )}}
              </button>"""
              
    content = re.sub(
        r'<button\s+onClick=\{\(\) => !isSidebarMinimized && toggleGroup\(\'(.*?)\'\)\}\s+className=\{`(.*?)(?:px-4)(.*?) \$\{isSidebarMinimized \? \'justify-center\' : \'\'\}`\}\s+title=\{isSidebarMinimized \? \'(.*?)\' : \'\'\}\s*>\s*(.*?)\s*</button>',
        replace_group_btn,
        content,
        flags=re.DOTALL
    )

    # 3. Fix Link tooltips
    def replace_link(match):
        href = match.group(1)
        cls = match.group(2)
        title = match.group(3)
        inner = match.group(4)
        
        # ensure relative is in classes
        if 'relative' not in cls:
            cls = cls.replace('group', 'group relative')
            
        return f"""<Link href="{href}"
                  className={{`{cls}`}}
                >
{inner}
                  {{isSidebarMinimized && (
                    <div className="hidden group-hover:block absolute left-14 bg-slate-800 text-white text-[11px] px-2 py-1 rounded shadow-md whitespace-nowrap z-50">
                      {title}
                    </div>
                  )}}
                </Link>"""
                
    content = re.sub(
        r'<Link href="(.*?)"\s+className=\{`(.*?)`\}\s+title=\{isSidebarMinimized \? \'(.*?)\' : \'\'\}\s*>\s*(.*?)\s*</Link>',
        replace_link,
        content,
        flags=re.DOTALL
    )

    with open(path, 'w') as f:
        f.write(content)
    
    print("Done")

if __name__ == '__main__':
    main()
